import { requireSuperAdmin } from "@/lib/auth-utils";
import { AppHeader } from "@/components/app-header";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will throw if not super-admin
  await requireSuperAdmin();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
      <AppHeader />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
