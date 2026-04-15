"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { getPolarSuccessBaseUrl, requireEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { polarClient } from "@/lib/polar";

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

export async function createProCheckoutUrl() {
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
    throw new Error("User must complete onboarding first.");
  }

  const productId = requireEnv("POLAR_PRO_PRODUCT_ID");
  const successBaseUrl = getPolarSuccessBaseUrl();

  let checkout: Awaited<ReturnType<typeof polarClient.checkouts.create>>;

  try {
    checkout = await polarClient.checkouts.create({
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
  } catch (error) {
    logger.error("billing.checkout.create_failed", {
      userId: user.id,
      organizationId: user.organizationId,
      error,
    });
    throw new Error(
      "Unable to start checkout. Please contact support if this continues.",
    );
  }

  if (!checkout.url) {
    throw new Error("No checkout URL received from Polar.");
  }

  return checkout.url;
}

export async function createBillingPortalUrl() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      organizationId: true,
    },
  });

  if (!user?.organizationId) {
    throw new Error("User must complete onboarding first.");
  }

  try {
    const customerSession = await polarClient.customerSessions.create({
      externalCustomerId: user.id,
    });

    if (!customerSession.customerPortalUrl) {
      throw new Error("No customer portal URL received from Polar.");
    }

    return customerSession.customerPortalUrl;
  } catch (error) {
    logger.warn("billing.portal.create_failed_falling_back_to_checkout", {
      userId: user.id,
      organizationId: user.organizationId,
      error,
    });
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
