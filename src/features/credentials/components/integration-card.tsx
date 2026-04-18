"use client";

import Image from "next/image";
import { MoreHorizontal, Link2, Plug } from "lucide-react";
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
    <div className="group relative bg-[#FDFDFD] border border-slate-200/60 rounded-[32px] p-8 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col items-center text-center h-full">
      {/* Active Indicator */}
      {isConnected && (
        <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 shadow-sm shadow-emerald-100/20">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
            Active
          </span>
        </div>
      )}

      {/* Logo Container */}
      <div className="mt-4 mb-6 relative">
        <div className="size-20 flex items-center justify-center rounded-3xl bg-white border border-slate-100 shadow-sm p-4 overflow-hidden group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
          {logo ? (
            <Image
              src={logo}
              alt={name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <Plug className="size-10 text-slate-200" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-8 flex-1">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
          {name}
        </h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Auth Tags & Action */}
      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">
            {authType}
          </span>
          {authType === "OAUTH2" && (
            <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-600 uppercase tracking-widest shadow-sm">
              BEARER TOKEN
            </span>
          )}
        </div>

        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={cn(
            "w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
            isConnected
              ? "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 hover:text-slate-600 active:scale-95"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.98]"
          )}
        >
          {isConnecting ? (
            <MoreHorizontal className="size-5 animate-pulse" />
          ) : isConnected ? (
            <>
              <Link2 className="size-4" />
              <span>Connected</span>
            </>
          ) : (
            "Connect Integration"
          )}
        </button>
      </div>
    </div>
  );
};
