"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Filter, Layers, Zap } from "lucide-react";

export const CATEGORIES = [
  "Developer Tools & DevOps",
  "Collaboration & Communication",
  "AI & Machine Learning",
  "Document & File Management",
  "Productivity & Project Management",
  "CRM",
  "Analytics & Data",
  "Entertainment & Media",
  "Education & LMS",
  "Design & Creative Tools",
  "Marketing & Social Media",
  "Scheduling & Booking",
  "E-commerce",
];

interface SetupSidebarProps {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
}

export const SetupSidebar = ({ selectedCategories, onCategoryChange }: SetupSidebarProps) => {
  return (
    <div className="w-[300px] shrink-0 flex flex-col gap-10 py-2">
      <div>
        <div className="flex items-center gap-2 mb-8 px-1">
          <Filter className="size-4 text-slate-400" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Filter by Category
          </h3>
        </div>
        
        <div className="space-y-1.5">
          <button 
            onClick={() => onCategoryChange("All")}
            className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group text-left",
                selectedCategories.length === 0 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                  : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Layers className={cn("size-4", selectedCategories.length === 0 ? "text-slate-400" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="text-sm font-bold tracking-tight">All Integrations</span>
            </div>
            {selectedCategories.length === 0 && (
                <div className="size-1.5 rounded-full bg-slate-400" />
            )}
          </button>

          {CATEGORIES.map((category) => {
            const isActive = selectedCategories.includes(category);
            return (
                <button 
                  key={category} 
                  onClick={() => onCategoryChange(category)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group text-left",
                    isActive 
                      ? "bg-slate-100 text-slate-900" 
                      : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                        "size-2 rounded-full transition-all",
                        isActive ? "bg-slate-900 scale-100" : "bg-slate-200 scale-75 group-hover:bg-slate-300"
                    )} />
                    <span className="text-[13.5px] font-bold tracking-tight">{category}</span>
                  </div>
                </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto">
        <div className="p-6 rounded-[32px] bg-slate-900 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 size-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10">
                <div className="p-2 bg-white/10 rounded-xl w-fit mb-4">
                    <Zap className="size-4 text-emerald-400 fill-emerald-400/20" />
                </div>
                <h4 className="text-base font-bold mb-2">Build Custom</h4>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">
                    Can't find an app? Our team can build it for you in 24 hours.
                </p>
                <button className="w-full py-2.5 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors shadow-sm">
                    REQUEST ACCESS
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
