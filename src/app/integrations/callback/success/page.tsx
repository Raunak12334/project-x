"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const toolkitSlug = searchParams.get("toolkit_slug") || "Integration";

  useEffect(() => {
    // Notify the opener window that the connection was successful
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "composio-connection-success",
          toolkitSlug,
        },
        window.location.origin
      );
    }

    // Automatically close the window after a few seconds
    const timer = setTimeout(() => {
      window.close();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toolkitSlug]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="space-y-8 max-w-md"
      >
        <div className="relative mx-auto w-24 h-24">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute inset-0 bg-emerald-50 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Connection Successful
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your <span className="text-slate-900 font-bold">{toolkitSlug}</span> account has been securely connected to Otogent.
          </p>
        </div>

        <div className="pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 italic text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Loader2 className="size-3 animate-spin" />
            Closing window automatically...
          </div>
        </div>
        
        <button 
          onClick={() => window.close()}
          className="w-full text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]"
        >
          Close manually
        </button>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="size-8 text-slate-200 animate-spin" />
        </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
