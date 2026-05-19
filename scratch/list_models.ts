import { PrismaClient } from "@prisma/client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { decrypt } from "../src/lib/encryption";

const prisma = new PrismaClient();

async function main() {
  const credential = await prisma.credential.findFirst({
    where: { type: "GEMINI" },
  });

  if (!credential || !credential.valueEncrypted) {
    console.error("No Gemini credential found.");
    process.exit(1);
  }

  const apiKey = decrypt(credential.valueEncrypted);
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // There is no explicit listModels in the JS SDK, but we can hit the REST endpoint directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available Models:");
    data.models?.forEach((m: any) => console.log(m.name, m.supportedGenerationMethods));
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
