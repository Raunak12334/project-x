import { headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { enforceAppRouting } from "@/lib/auth-utils";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers();
  const fullUrl = headersList.get("x-url") || "";
  const isTemplatesPage = fullUrl.endsWith("/templates");

  // Only enforce auth if not the public templates page
  if (!isTemplatesPage) {
    await enforceAppRouting("/workflows");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50 dark:bg-slate-950/50">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
