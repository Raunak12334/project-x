"use client";

import { 
  MessageSquare, 
  Plug2, 
  BrainCircuit, 
  Zap, 
  ShieldCheck, 
  Settings2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon: Icon, label, isActive }: SidebarItemProps) => (
  <div
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
      isActive 
        ? "bg-slate-100 text-slate-900 shadow-sm" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("size-4", isActive ? "text-slate-900" : "text-slate-400")} />
    {label}
  </div>
);

export const SetupSidebar = () => {
  const items = [
    { icon: MessageSquare, label: "Channels" },
    { icon: Plug2, label: "Integrations", isActive: true },
    { icon: BrainCircuit, label: "Memory" },
    { icon: Zap, label: "Skills" },
    { icon: ShieldCheck, label: "Permissions" },
    { icon: Settings2, label: "Settings" },
  ];

  return (
    <div className="w-64 shrink-0 border-r border-slate-100 flex flex-col gap-6 pr-6">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">
          Setup
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};
