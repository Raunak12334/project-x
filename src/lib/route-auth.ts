import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getAuthenticatedRouteOrganization() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      organizationId: true,
    },
  });

  if (!user?.organizationId) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
  };
}
