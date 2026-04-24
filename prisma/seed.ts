import { hash } from "@node-rs/argon2";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create super-admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: "abhishekverma9920@gmail.com" },
    update: {},
    create: {
      id: "super-admin-id",
      name: "Super Admin",
      email: "abhishekverma9920@gmail.com",
      role: Role.SUPER_ADMIN,
      emailVerified: true,
      onboardingCompleted: true,
    },
  });

  // Hash password for Better Auth
  const hashedPassword = await hash("admin123");

  // Create account entry for email/password auth
  await prisma.account.upsert({
    where: { id: "admin-account-id" },
    update: {},
    create: {
      id: "admin-account-id",
      accountId: "abhishekverma9920@gmail.com",
      providerId: "email",
      userId: superAdmin.id,
      passwordHash: hashedPassword,
    },
  });

  console.log("Super admin created with credentials:", {
    email: "abhishekverma9920@gmail.com",
    password: "admin123",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
