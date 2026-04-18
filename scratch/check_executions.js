const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestExecutions = await prisma.nodeExecution.findMany({
    take: 10,
    orderBy: { startedAt: 'desc' },
    include: {
      node: {
        select: {
          type: true,
          name: true,
        }
      },
    }
  });

  console.log('--- Latest Node Executions ---');
  latestExecutions.forEach(ex => {
    console.log(`Node: ${ex.node.name} (${ex.node.type}) | Status: ${ex.status} | Started: ${ex.startedAt.toISOString()}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
