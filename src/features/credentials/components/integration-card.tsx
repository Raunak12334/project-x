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
        "group relative flex items-center justify-between p-6 bg-white border border-slate-200/60 rounded-[28px] transition-all duration-300",
        "hover:border-slate-300 hover:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-0.5",
        isConnected && "bg-slate-50/40 border-emerald-100/50",
      )}
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        {/* Logo Section */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "size-14 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm p-3 transition-all duration-300",
              "group-hover:scale-105 group-hover:shadow-md",
              isConnected && "border-emerald-100 shadow-emerald-100/10",
            )}
          >
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={32}
                height={32}
                className="size-full object-contain filter "
              />
            ) : (
              <Plug className="size-6 text-slate-300" />
            )}
          </div>
          {isConnected && (
            <div className="absolute -top-1.5 -right-1.5 size-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="flex flex-col gap-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight truncate">
              {name}
            </h3>
            {authType === "API_KEY" && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-tighter">
                KEY
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-500 font-medium leading-normal line-clamp-1 group-hover:line-clamp-none transition-all">
            {description}
          </p>
        </div>
      </div>

      {/* Action Section */}
      <div className="shrink-0 flex items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Connected
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className={cn(
              "size-11 flex items-center justify-center rounded-2xl transition-all duration-300 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 active:scale-95 shadow-sm",
              isConnecting && "bg-slate-50 border-slate-200",
            )}
            title="Connect Integration"
          >
            {isConnecting ? (
              <Loader2 className="size-5 animate-spin text-slate-900" />
            ) : (
              <Link2 className="size-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
