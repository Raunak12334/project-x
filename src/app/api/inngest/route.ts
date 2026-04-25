import { serve } from "inngest/next";
export const maxDuration = 60; // Max allowed for Vercel Hobby, completely solves AI timeouts

import { inngest } from "@/inngest/client";
import { executeWorkflow, onUserSignup } from "@/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow, onUserSignup],
});
