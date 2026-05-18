import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface ComparisonTableProps {
  competitorName: string;
  features: {
    name: string;
    otogent: string | boolean;
    competitor: string | boolean;
  }[];
}

export function ComparisonTable({ competitorName, features }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto my-12 border border-border rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="p-4 font-semibold w-1/3">Feature / Architecture</th>
            <th className="p-4 font-semibold text-primary w-1/3 border-l border-border bg-primary/5">
              Otogent
            </th>
            <th className="p-4 font-semibold w-1/3 border-l border-border">
              {competitorName}
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, idx) => (
            <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <td className="p-4 text-sm font-medium">{feature.name}</td>
              <td className="p-4 text-sm border-l border-border bg-primary/5">
                {typeof feature.otogent === "boolean" ? (
                  feature.otogent ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )
                ) : (
                  feature.otogent
                )}
              </td>
              <td className="p-4 text-sm border-l border-border text-muted-foreground">
                {typeof feature.competitor === "boolean" ? (
                  feature.competitor ? (
                    <Check className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )
                ) : (
                  feature.competitor
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
