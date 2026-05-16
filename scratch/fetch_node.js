const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const node = await prisma.node.findUnique({
    where: { id: 'ytepuolo5emxjfijy0gf5qbg' },
    select: { data: true }
  });
  console.log(JSON.stringify(node, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
