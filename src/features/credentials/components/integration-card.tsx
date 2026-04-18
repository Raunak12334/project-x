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
}

export const IntegrationCard = ({
  name,
  logo,
  description,
  isConnected,
  onConnect,
  isConnecting,
}: IntegrationCardProps) => {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="size-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-2.5 overflow-hidden group-hover:scale-110 transition-transform duration-300">
          {logo ? (
            <Image
              src={logo}
              alt={name}
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <Plug className="size-6 text-slate-400" />
          )}
        </div>
        
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 leading-tight truncate">
            {name}
          </h3>
          {isConnected && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                Active
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-end mt-auto pt-2">
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={cn(
            "p-2.5 rounded-xl transition-all duration-200",
            isConnected
              ? "text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/10 active:scale-95",
            isConnecting && "opacity-50 cursor-not-allowed"
          )}
        >
          <Link2 className={cn("size-5", isConnecting && "animate-spin")} />
        </button>
      </div>
    </div>
  );
};
