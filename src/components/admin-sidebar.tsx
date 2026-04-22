"use client";

import {
  Building2Icon,
  CreditCardIcon,
  FileTextIcon,
  HistoryIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  MessageSquareIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
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

export const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const adminMenuItems = [
    {
      title: "Platform Command",
      items: [
        { title: "Dashboard", icon: LayoutTemplateIcon, url: "/super-admin" },
        {
          title: "Organizations",
          icon: Building2Icon,
          url: "/super-admin/organizations",
        },
        { title: "Users Hub", icon: UsersIcon, url: "/super-admin/users" },
        {
          title: "Support Tickets",
          icon: MessageSquareIcon,
          url: "/super-admin/tickets",
        },
        {
          title: "Blog Studio",
          icon: FileTextIcon,
          url: "/super-admin/blog",
        },
      ],
    },
    {
      title: "Infrastructure",
      items: [
        {
          title: "Revenue & Billing",
          icon: CreditCardIcon,
          url: "/super-admin/billing",
        },
        { title: "Forensic Logs", icon: HistoryIcon, url: "/super-admin/logs" },
        {
          title: "Global Settings",
          icon: SettingsIcon,
          url: "/super-admin/settings",
        },
      ],
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 dark:border-slate-800"
    >
      <SidebarHeader className="border-b border-slate-100 dark:border-slate-800 p-4">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton
            asChild
            className="gap-x-3 h-10 px-2 justify-start hover:bg-transparent"
          >
            <BrandLockup
              href="/super-admin"
              imageSize={34}
              textClassName="font-bold text-slate-900 dark:text-white"
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {adminMenuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">
              {group.title}
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className={`h-10 px-4 transition-all duration-200 ${
                        pathname === item.url
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Link href={item.url}>
                        <item.icon
                          className={`size-4 ${pathname === item.url ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}
                        />
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
              className="w-full justify-start gap-3 h-10 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold transition-colors"
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/login"),
                  },
                });
              }}
            >
              <LogOutIcon className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
