import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const deleted = await prisma.composioIntegration.deleteMany({
      where: {
        toolkitSlug: "discordbot",
      },
    });
    return NextResponse.json({ 
      message: "Successfully deleted Discord Bot connections!", 
      count: deleted.count,
      nextStep: "Go back to your Credentials page in Otogent. The Connect button should now be visible."
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
