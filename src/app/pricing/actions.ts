"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { getPolarSuccessBaseUrl, requireEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getPolarClient } from "@/lib/polar";

function isPaidPlan(plan: "FREE" | "PRO" | "CUSTOM" | "ENTERPRISE") {
  return plan === "PRO" || plan === "CUSTOM" || plan === "ENTERPRISE";
}

export async function selectFreeTier() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user || !user.organizationId) {
    throw new Error("User must complete onboarding first.");
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: { organizationId: user.organizationId },
  });

  if (
    existingSubscription?.status === "ACTIVE" &&
    isPaidPlan(existingSubscription.plan)
  ) {
    redirect("/workflows");
  }

  const now = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  await prisma.subscription.upsert({
    where: { organizationId: user.organizationId },
    create: {
      organizationId: user.organizationId,
      plan: "FREE",
      status: "ACTIVE",
      freeTierStartedAt: now,
      expiresAt: expires,
      workflowLimit: 2,
    },
    update: {
      plan: "FREE",
      status: "ACTIVE",
      freeTierStartedAt: now,
      expiresAt: expires,
      canceledAt: null,
      workflowLimit: 2,
    },
  });

  redirect("/workflows");
}

export async function createProCheckoutUrl(): Promise<
  { url: string; error?: never } | { url?: never; error: string }
> {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        organizationId: true,
      },
    });

    if (!user?.organizationId) {
      return { error: "User must complete onboarding first." };
    }

    const productId = requireEnv("POLAR_PRO_PRODUCT_ID");
    const successBaseUrl = getPolarSuccessBaseUrl();

    const polar = getPolarClient();
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${successBaseUrl}/workflows?success=true`,
      externalCustomerId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      metadata: {
        userId: user.id,
        organizationId: user.organizationId,
        plan: "pro",
      },
      customerMetadata: {
        userId: user.id,
        organizationId: user.organizationId,
      },
    });

    if (!checkout.url) {
      return { error: "No checkout URL received from Polar." };
    }

    return { url: checkout.url };
  } catch (error: any) {
    // If it's a redirect, we must re-throw it so Next.js handles it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    logger.error("billing.checkout.create_failed", { error });
    return {
      error:
        error.message ||
        "Unable to start checkout. Please check if POLAR_PRO_PRODUCT_ID is configured.",
    };
  }
}

export async function createBillingPortalUrl(): Promise<
  { url: string; error?: never } | { url?: never; error: string }
> {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!user?.organizationId) {
      return { error: "User must complete onboarding first." };
    }

    const polar = getPolarClient();
    const customerSession = await polar.customerSessions.create({
      externalCustomerId: user.id,
    });

    if (!customerSession.customerPortalUrl) {
      return { error: "No customer portal URL received from Polar." };
    }

    return { url: customerSession.customerPortalUrl };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    logger.warn("billing.portal.create_failed_falling_back_to_checkout", {
      error,
    });
    // Fallback to checkout if portal fails (usually means no existing customer in Polar)
    return createProCheckoutUrl();
  }
}

export async function requestCustomPlan() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true,
      organization: { select: { name: true } },
    },
  });

  if (!user?.organizationId) {
    throw new Error("User must complete onboarding first.");
  }

  const existingTicket = await prisma.supportTicket.findFirst({
    where: {
      organizationId: user.organizationId,
      subject: "Custom plan request",
      status: { in: ["OPEN", "IN_PROGRESS"] },
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existingTicket) {
    return {
      message: "Your custom plan request is already in our queue.",
    };
  }

  await prisma.supportTicket.create({
    data: {
      subject: "Custom plan request",
      description: `Custom plan request from ${session.user.email} for ${user.organization?.name || "their organization"}.`,
      priority: "HIGH",
      userId: session.user.id,
      organizationId: user.organizationId,
    },
  });

  return {
    message: "Thanks. Our team will contact you about a custom plan.",
  };
}
