"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    <div className="w-72 shrink-0 border-r border-slate-100 flex flex-col gap-8 pr-6 py-4 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-6 px-3">
          Categories
        </h3>
        
        <div className="space-y-4 px-3">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onCategoryChange("All")}>
            <Checkbox 
                id="cat-all" 
                checked={selectedCategories.length === 0} 
                onCheckedChange={() => onCategoryChange("All")}
                className="rounded-md border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
            />
            <Label 
                htmlFor="cat-all" 
                className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors cursor-pointer"
            >
              All
            </Label>
          </div>

          {CATEGORIES.map((category) => (
            <div 
                key={category} 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => onCategoryChange(category)}
            >
              <Checkbox 
                id={`cat-${category}`} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryChange(category)}
                className="rounded-md border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
              />
              <Label 
                htmlFor={`cat-${category}`} 
                className={cn(
                    "text-sm font-medium transition-colors cursor-pointer",
                    selectedCategories.includes(category) ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                )}
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-6 px-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Request Integration</h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Can't find what you're looking for? Let us know.
            </p>
            <button className="text-xs font-bold text-slate-900 hover:underline">
                Submit Request →
            </button>
        </div>
      </div>
    </div>
  );
};
