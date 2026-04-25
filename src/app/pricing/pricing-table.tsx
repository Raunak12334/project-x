"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createProCheckoutUrl,
  requestCustomPlan,
  selectFreeTier,
} from "./actions";

export function PricingTable() {
  const [loading, setLoading] = useState<"free" | "pro" | "enterprise" | null>(
    null,
  );

  const handleSelectFree = async () => {
    setLoading("free");
    try {
      await selectFreeTier();
    } catch (error) {
      console.error(error);
      setLoading(null);
    }
  };

  const handleCheckoutPro = async () => {
    setLoading("pro");
    try {
      const result = await createProCheckoutUrl();
      if (!result.url) {
        throw new Error(result.error || "Unknown error occurred.");
      }
      window.location.href = result.url;
    } catch (error: any) {
      console.error("Checkout failed:", error);
      setLoading(null);
      alert(error.message || "Checkout failed. Please try again or contact support.");
    }
  };

  const handleRequestCustom = async () => {
    setLoading("enterprise");
    try {
      const result = await requestCustomPlan();
      alert(result.message);
    } catch (error) {
      console.error("Custom plan request failed:", error);
      alert("Custom plan request failed. Please contact support@otogent.com.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-20">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-medium tracking-tight mb-4">
            Select Your Plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scale your multi-agent workforce. Start with our 7-day free trial on
            the Free Tier or jump into unparalleled productivity with Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="border border-border bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm relative flex flex-col">
            <h3 className="text-xl font-medium mb-2">Free Tier</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Perfect for trying out the platform.
            </p>
            <div className="text-4xl font-semibold mb-6">$0</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> 7 days free access
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> Max 2 Workflows
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <X className="h-4 w-4" /> No custom models
              </li>
            </ul>
            <Button
              variant="outline"
              onClick={handleSelectFree}
              disabled={loading !== null}
              className="w-full rounded-xl py-6"
            >
              {loading === "free" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Start Free Trial"
              )}
            </Button>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="border border-primary bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-medium mb-2">Pro</h3>
            <p className="text-muted-foreground text-sm mb-6">
              For teams automating real workflows.
            </p>
            <div className="text-4xl font-semibold mb-6">
              $49
              <span className="text-lg text-muted-foreground font-normal">
                /mo
              </span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> Unlimited Workflows
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> All Model
                integrations
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> Priority support
              </li>
            </ul>
            <Button
              onClick={handleCheckoutPro}
              disabled={loading !== null}
              className="w-full rounded-xl py-6"
            >
              {loading === "pro" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          </div>

          {/* Custom Tier */}
          <div className="border border-border bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm relative flex flex-col">
            <h3 className="text-xl font-medium mb-2">Custom</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Custom limits and dedicated hosting.
            </p>
            <div className="text-4xl font-semibold mb-6">Custom</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> Custom SLA
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> Dedicated success
                manager
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary" /> On-prem deployments
              </li>
            </ul>
            <Button
              variant="outline"
              onClick={handleRequestCustom}
              disabled={loading !== null}
              className="w-full rounded-xl py-6"
            >
              {loading === "enterprise" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Contact Sales"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
