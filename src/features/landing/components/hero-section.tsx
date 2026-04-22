"use client";

import { motion } from "framer-motion";
import { Play, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeUp = (delay: number, y: number = 16, duration: number = 0.6) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: "easeOut" as const },
});

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-start overflow-hidden h-screen pt-20 pb-10">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full pt-10 md:pt-16 px-4">
        {/* Badge */}
        <motion.div
          {...fadeUp(0, 10, 0.5)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm text-foreground font-body mb-8"
        >
          <Settings className="h-3.5 w-3.5" />
          Infra. for Multi Agent System
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1, 16, 0.6)}
          className="text-center font-display text-5xl md:text-7xl lg:text-[5rem] leading-[1] tracking-[-0.04em] text-foreground max-w-4xl"
        >
          Automate your workflow with <br className="hidden md:block" /> multi-agent catalyst
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          {...fadeUp(0.2, 16, 0.6)}
          className="mt-8 text-center text-base md:text-lg text-foreground/80 max-w-[800px] leading-relaxed font-body"
        >
          Automate your busywork with intelligent agents that learn, adapt, and execute—so your team can focus on what matters most.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp(0.3, 16, 0.6)}
          className="mt-10 flex items-center gap-5"
        >
          <Button
            asChild
            className="rounded-full px-8 py-7 text-base font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg"
          >
            <Link href="/signup">Start Building Now</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full border-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-md"
          >
            <a href="#how-it-works">
              <Play className="h-5 w-5 fill-current" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
