const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const latestExecution = await prisma.execution.findFirst({
    orderBy: { createdAt: "desc" },
    where: {
      status: "FAILED",
    },
    take: 1,
  });

  if (latestExecution) {
    console.log("Error details from latest failed execution:");
    console.log("Status:", latestExecution.status);
    console.log("Error Message:", latestExecution.error);
    console.log("Error Stack:", latestExecution.errorStack);
  } else {
    console.log("No failed executions found.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
