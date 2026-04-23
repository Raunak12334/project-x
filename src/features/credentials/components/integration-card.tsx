"use client";

import { CheckCircle2, Link2, Loader2, Plug } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  name: string;
  logo?: string | null;
  description: string;
  isConnected: boolean;
  onConnect: () => void;
  isConnecting?: boolean;
  authType?: string;
}

export const IntegrationCard = ({
  name,
  logo,
  description,
  isConnected,
  onConnect,
  isConnecting,
  authType = "OAUTH2",
}: IntegrationCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background p-4 transition-all duration-200",
        "hover:border-border hover:bg-muted/20 hover:shadow-sm",
        isConnected && "border-emerald-200 bg-emerald-50/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Logo Section */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg border bg-background p-2 transition-all duration-200",
              "group-hover:shadow-sm",
              isConnected && "border-emerald-200",
            )}
          >
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={32}
                height={32}
                className="size-full object-contain"
              />
            ) : (
              <Plug className="size-5 text-muted-foreground" />
            )}
          </div>
          {isConnected && (
            <div className="-right-1 -top-1 absolute flex size-4 items-center justify-center rounded-full border border-emerald-200 bg-background shadow-sm">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="flex min-w-0 flex-col gap-1 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {name}
            </h3>
            {authType === "API_KEY" && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-700">
                KEY
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex shrink-0 items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              Connected
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-all duration-200 hover:border-foreground/30 hover:bg-muted hover:text-foreground active:scale-95",
              isConnecting && "border-border bg-muted",
            )}
            title="Connect Integration"
          >
            {isConnecting ? (
              <Loader2 className="size-4 animate-spin text-foreground" />
            ) : (
              <Link2 className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
