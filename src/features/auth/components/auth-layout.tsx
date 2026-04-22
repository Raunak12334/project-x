import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="https://otogent.com"
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
        <BrandLockup
          href="/"
          imageSize={30}
          className="self-center font-medium"
        />
        {children}
      </div>
    </div>
  );
};
