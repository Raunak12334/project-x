import { BadgeCheck, Building2, Crown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { SignOutButton } from "./sign-out-button";

export default async function ProfileSettingsPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organization: {
        include: { subscription: true },
      },
    },
  });

  if (!user || !user.organization) {
    return <div>Profile could not be loaded.</div>;
  }

  const { organization } = user;
  const isFree = organization.subscription?.plan === "FREE";
  const planLabel =
    organization.subscription?.plan === "ENTERPRISE"
      ? "CUSTOM"
      : organization.subscription?.plan || "UNKNOWN";

  return (
    <div className="max-w-3xl mx-auto p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight font-display mb-2">
          Profile & Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your personal information and view organizational status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        <div className="border rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Personal Information</h2>
          </div>
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-1 block">
                Full Name
              </div>
              <div className="font-medium">{user.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1 block">
                Email
              </div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1 block">
                System Role
              </div>
              <Badge
                variant={user.role === "ADMIN" ? "default" : "secondary"}
                className="mt-1"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Company & Subscription Details */}
        <div className="border rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Organization Info</h2>
          </div>
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-1 block">
                Workspace Name
              </div>
              <div className="font-medium">{organization.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1 block">
                Primary Use Case
              </div>
              <div className="font-medium capitalize">
                {organization.useCase}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t mt-2">
              <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4" /> Subscription Status
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${isFree ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400" : "bg-primary/20 text-primary"}`}
                  >
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{planLabel} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {isFree
                        ? `Expires: ${organization.subscription?.expiresAt?.toLocaleDateString() || "Unknown"}`
                        : "Active Enterprise Access"}
                    </p>
                  </div>
                </div>
                {isFree && (
                  <Button asChild>
                    <a href="/pricing">Upgrade</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-200 dark:border-red-900/50 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden mt-8">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">
                Sign Out
              </h3>
              <p className="text-sm text-muted-foreground">
                End your current working session
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
