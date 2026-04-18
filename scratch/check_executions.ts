import prisma from "@/lib/db";

async function main() {
  const latestExecutions = await prisma.nodeExecution.findMany({
    take: 10,
    orderBy: { startedAt: 'desc' },
    include: {
      node: true,
    }
  });

  console.log(JSON.stringify(latestExecutions, null, 2));
}

main().catch(console.error);
