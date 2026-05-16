
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) {
      console.log("No organization found");
      return;
    }

    console.log("Creating credential...");
    const credential = await prisma.credential.create({
      data: {
        name: "Test Credential",
        type: "OPENAI",
        organizationId: org.id,
        valueEncrypted: "dummy",
        accessRoles: [],
      },
    });
    console.log("Created successfully:", credential.id);
    
    // Clean up
    await prisma.credential.delete({ where: { id: credential.id } });
    console.log("Deleted test credential");
  } catch (error) {
    console.error("Error creating credential:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
