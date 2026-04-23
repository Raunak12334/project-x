"use client";

import { BracesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { VariableSuggestion } from "../lib/variable-suggestions";

type Props = {
  suggestions: VariableSuggestion[];
  onInsert: (token: string) => void;
};

export const VariablePicker = ({ suggestions, onInsert }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-2">
          <BracesIcon className="size-3.5" />
          Insert variable
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <div className="max-h-72 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Connect an upstream node with a saved variable name first.
            </div>
          ) : (
            <div className="space-y-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.token}
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-muted"
                  onClick={() => onInsert(suggestion.token)}
                >
                  <div className="text-sm font-medium">{suggestion.label}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {suggestion.token}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
