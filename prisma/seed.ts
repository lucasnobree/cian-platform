import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: "marcela" },
  });

  if (existing) {
    console.log("User 'marcela' already exists, skipping seed.");
    return;
  }

  await prisma.user.create({
    data: {
      username: "marcela",
      name: "Marcela",
      hashedPassword: hashSync("cian2024", 12),
      role: "owner",
      isActive: true,
    },
  });

  console.log("Owner user created: marcela / cian2024");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
