"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LayoutTemplateIcon,
  LifeBuoyIcon,
  LogOutIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  createBillingPortalUrl,
  createProCheckoutUrl,
} from "@/app/pricing/actions";
import { useTRPC } from "@/trpc/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BrandLockup } from "@/components/brand-lockup";
import { authClient } from "@/lib/auth-client";

export const UserSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const trpc = useTRPC();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const { data: subscription } = useQuery(
    trpc.subscriptions.getCurrent.queryOptions(),
  );
  const isPro = subscription?.plan === "PRO" || subscription?.plan === "CUSTOM";

  const handleUpgradeToPro = async () => {
    setUpgradeLoading(true);
    try {
      const result = await createProCheckoutUrl();
      if (!result.url) {
        throw new Error(result.error || "Unknown error occurred.");
      }
      window.location.href = result.url;
    } catch (error: any) {
      console.error("Upgrade checkout failed:", error);
      alert(
        error.message || "Upgrade failed. Please try again or contact support.",
      );
      setUpgradeLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const result = await createBillingPortalUrl();
      if (!result.url) {
        throw new Error(result.error || "Unknown error occurred.");
      }
      window.location.href = result.url;
    } catch (error: any) {
      console.error("Billing portal failed:", error);
      alert(
        error.message ||
          "Billing portal failed. Please try again or contact support.",
      );
      setBillingLoading(false);
    }
  };

  const userMenuItems = [
    {
      title: "Workspace",
      items: [
        { title: "Workflows", icon: FolderOpenIcon, url: "/workflows" },
        { title: "Templates", icon: LayoutTemplateIcon, url: "/templates" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "Credentials", icon: KeyIcon, url: "/credentials" },
        { title: "Executions", icon: HistoryIcon, url: "/executions" },
        { title: "Support & Help", icon: LifeBuoyIcon, url: "/support" },
      ],
    },
    {
      title: "Organization",
      items: [
        { title: "Team Members", icon: UsersIcon, url: "/team" },
        {
          title: "Profile Settings",
          icon: SettingsIcon,
          url: "/settings/profile",
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3 border-b border-slate-100 dark:border-slate-800">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton
            asChild
            className="gap-x-3 h-10 px-2 hover:bg-transparent"
          >
            <BrandLockup
              imageSize={34}
              textClassName="font-bold text-slate-900 dark:text-white"
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {userMenuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100 dark:border-slate-800">
        <SidebarMenu className="gap-3">
          {!isPro && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="w-full justify-start gap-3 h-10 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
                onClick={handleUpgradeToPro}
                disabled={upgradeLoading}
              >
                <StarIcon className="size-4" />
                <span>
                  {upgradeLoading ? "Opening Checkout..." : "Upgrade to Pro"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start gap-3 h-10 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-colors"
              onClick={handleOpenBillingPortal}
              disabled={billingLoading}
            >
              <CreditCardIcon className="size-4" />
              <span>
                {billingLoading ? "Opening Billing..." : "Billing Portal"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start gap-3 h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition-colors"
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/login"),
                  },
                });
              }}
            >
              <LogOutIcon className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
