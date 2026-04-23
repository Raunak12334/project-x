"use client";

import { Filter, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEFAULT_CATEGORIES = [
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
  "HR & Finance",
  "Other",
];

interface SetupSidebarProps {
  categories?: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
}

export const SetupSidebar = ({
  categories = DEFAULT_CATEGORIES,
  selectedCategories,
  onCategoryChange,
}: SetupSidebarProps) => {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg border bg-muted/20 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
      <div>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Filter className="size-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Filter by Category
          </h3>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          <button
            type="button"
            onClick={() => onCategoryChange("All")}
            className={cn(
              "group flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 lg:w-full",
              selectedCategories.length === 0
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              <Layers
                className={cn(
                  "size-4",
                  selectedCategories.length === 0
                    ? "text-background/70"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="whitespace-nowrap text-sm font-medium">
                All Integrations
              </span>
            </div>
            {selectedCategories.length === 0 && (
              <div className="size-1.5 rounded-full bg-background/70" />
            )}
          </button>

          {categories.map((category) => {
            const isActive = selectedCategories.includes(category);
            return (
              <button
                type="button"
                key={category}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "group flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 lg:w-full",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "size-2 rounded-full transition-all",
                      isActive
                        ? "scale-100 bg-foreground"
                        : "scale-75 bg-border group-hover:bg-muted-foreground/40",
                    )}
                  />
                  <span className="whitespace-nowrap text-sm font-medium lg:whitespace-normal">
                    {category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
