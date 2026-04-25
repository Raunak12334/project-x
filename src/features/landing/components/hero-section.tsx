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
    <section className="relative flex flex-col items-center justify-start overflow-hidden h-screen pt-20 pb-10 font-brand">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_poster.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full pt-10 md:pt-16 px-4">
        {/* Badge */}
        <motion.div
          {...fadeUp(0, 10, 0.5)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm text-foreground mb-8"
        >
          <Settings className="h-3.5 w-3.5" />
          Multi-Agent AI Automation Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1, 16, 0.6)}
          className="text-center font-brand text-6xl md:text-8xl lg:text-[7rem] leading-[1.05] tracking-tight text-foreground max-w-5xl"
        >
          Otogent: The Execution Layer <br className="hidden md:block" />{" "}
          for Multi-Agent Workflows
        </motion.h1>

        {/* Supporting SEO Line */}
        <motion.p
          {...fadeUp(0.15, 16, 0.6)}
          className="mt-4 text-center text-xl md:text-2xl font-medium text-primary"
        >
          Next-generation AI Automation for autonomous systems.
        </motion.p>

        {/* Subheadline */}
        <motion.p
          {...fadeUp(0.2, 16, 0.6)}
          className="mt-6 text-center text-base md:text-lg text-foreground/80 max-w-[800px] leading-relaxed"
        >
          Orchestrate a digital workforce of AI agents that reason, decide, and
          execute complex tasks across your business ecosystem. Otogent
          eliminates manual bottlenecks by providing a sovereign execution layer
          that runs your autonomous agentic workflows with precision and scale.
        </motion.p>

        {/* Differentiation Line */}
        <motion.p
          {...fadeUp(0.25, 16, 0.6)}
          className="mt-4 text-center text-sm font-semibold uppercase tracking-widest text-foreground/60"
        >
          Not just another automation tool—the complete autonomous system for the agentic era.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp(0.3, 16, 0.6)}
          className="mt-10 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-5">
            <Button
              asChild
              className="rounded-full px-8 py-7 text-base font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg"
            >
              <Link href="/signup">Deploy Your First Agent</Link>
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
          </div>
          
          {/* Trust Microcopy */}
          <p className="text-xs font-medium text-foreground/50 flex items-center gap-4">
            <span>No-code builder</span>
            <span className="h-1 w-1 rounded-full bg-foreground/20" />
            <span>Enterprise security</span>
            <span className="h-1 w-1 rounded-full bg-foreground/20" />
            <span>Setup in minutes</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
