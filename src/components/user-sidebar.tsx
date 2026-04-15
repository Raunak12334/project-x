"use client";

import {
  BotIcon,
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
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  createBillingPortalUrl,
  createProCheckoutUrl,
} from "@/app/pricing/actions";
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
import { authClient } from "@/lib/auth-client";

export const UserSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const handleUpgradeToPro = async () => {
    setUpgradeLoading(true);
    try {
      const checkoutUrl = await createProCheckoutUrl();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Upgrade checkout failed:", error);
      alert("Upgrade failed. Please try again or contact support.");
      setUpgradeLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const portalUrl = await createBillingPortalUrl();
      window.location.href = portalUrl;
    } catch (error) {
      console.error("Billing portal failed:", error);
      alert("Billing portal failed. Please try again or contact support.");
      setBillingLoading(false);
    }
  };

  const userMenuItems = [
    {
      title: "Workspace",
      items: [
        { title: "Workflows", icon: FolderOpenIcon, url: "/workflows" },
        { title: "AI Agents", icon: BotIcon, url: "/agents" },
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
            <Link href="/" prefetch>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="otogent"
                  width={34}
                  height={34}
                  className="shrink-0 drop-shadow-sm"
                />
                <span className="font-black text-xl tracking-tighter uppercase text-slate-900 dark:text-white">
                  otogent
                </span>
              </div>
            </Link>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start gap-3 h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition-colors"
              onClick={handleUpgradeToPro}
              disabled={upgradeLoading}
            >
              <StarIcon className="size-4" />
              <span>
                {upgradeLoading ? "Opening Checkout..." : "Upgrade to Pro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start gap-3 h-10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition-colors"
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
