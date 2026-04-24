import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting orphaned workflow versions...');
  const result1 = await prisma.$executeRaw`DELETE FROM "workflow_version" WHERE "workflowId" NOT IN (SELECT id FROM "workflow")`;
  console.log('Orphaned workflow_versions deleted:', result1);

  const result2 = await prisma.$executeRaw`DELETE FROM "node" WHERE "workflowId" NOT IN (SELECT id FROM "workflow")`;
  console.log('Orphaned nodes deleted:', result2);

  const result3 = await prisma.$executeRaw`DELETE FROM "connection" WHERE "workflowId" NOT IN (SELECT id FROM "workflow")`;
  console.log('Orphaned connections deleted:', result3);

  const result4 = await prisma.$executeRaw`DELETE FROM "execution" WHERE "workflowId" NOT IN (SELECT id FROM "workflow")`;
  console.log('Orphaned executions deleted:', result4);

  console.log('Deleting orphaned execution_checkpoint...');
  const result5 = await prisma.$executeRaw`DELETE FROM "execution_checkpoint" WHERE "executionId" NOT IN (SELECT id FROM "execution")`;
  console.log('Orphaned execution checkpoints deleted:', result5);
  
  console.log('Deleting orphaned node_execution...');
  const result6 = await prisma.$executeRaw`DELETE FROM "node_execution" WHERE "executionId" NOT IN (SELECT id FROM "execution")`;
  console.log('Orphaned node executions deleted (execution reference):', result6);
  
  console.log('Deleting orphaned node_execution (node reference)...');
  const result7 = await prisma.$executeRaw`DELETE FROM "node_execution" WHERE "nodeId" NOT IN (SELECT id FROM "node")`;
  console.log('Orphaned node executions deleted (node reference):', result7);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
