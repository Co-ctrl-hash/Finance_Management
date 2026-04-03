import { Role } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

const main = async () => {
  const adminEmail = "admin@finance.local";
  const adminPassword = "Admin@123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists:", adminEmail);
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  await prisma.user.create({
    data: {
      name: "System Admin",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("Seed complete");
  console.log("Admin email:", adminEmail);
  console.log("Admin password:", adminPassword);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
