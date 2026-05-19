import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDiscordBot() {
  try {
    const deleted = await prisma.composioIntegration.deleteMany({
      where: {
        toolkitSlug: "discordbot"
      }
    });
    console.log(`Deleted ${deleted.count} Discord Bot connections.`);
  } catch (err) {
    console.error("Error deleting connections:", err);
  } finally {
    await prisma.$disconnect();
  }
}

resetDiscordBot();
