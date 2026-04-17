import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/landing-page";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "every SaaS company is becoming a GaaS company — Agentic as a Service \"Jensen Huang\"",
  description:
    "Otogent gives the Catalysts to Otomate your Workflows through multiple Agents Delegate Task.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // Check if user is super-admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role === "SUPER_ADMIN") {
      redirect("/super-admin");
    } else {
      redirect("/workflows");
    }
  }

  return <LandingPage />;
}
