import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.account.update({
    where: { id: "admin-account-id" },
    data: {
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$UDuM9oY5dVodF5sWNef09A$qlkNRAwGfi+WmGG4OfzkkB0NHNdH1HTz1udkXcmjyGc",
      providerId: "email",
    },
  });
  console.log("Successfully updated admin account:", result.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
