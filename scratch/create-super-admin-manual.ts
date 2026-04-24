import { hash } from "@node-rs/argon2";
import { createId } from "@paralleldrive/cuid2";
import { type Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "abhishekverma9920@gmail.com";
  const password = "otogent_abhi_raunak@otogent.com";
  const userId = createId();

  console.log(`Creating Super Admin: ${email}`);

  const hashedPassword = await hash(password);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Delete existing if any to avoid conflicts
    await tx.account.deleteMany({ where: { accountId: email } });
    await tx.user.deleteMany({ where: { email } });

    const user = await tx.user.create({
      data: {
        id: userId,
        name: "Abhishek Verma",
        email: email,
        role: "SUPER_ADMIN",
        emailVerified: true,
        onboardingCompleted: true,
      },
    });

    await tx.account.create({
      data: {
        id: createId(),
        accountId: email,
        providerId: "email",
        userId: user.id,
        passwordHash: hashedPassword,
      },
    });
  });

  console.log("Super Admin created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
