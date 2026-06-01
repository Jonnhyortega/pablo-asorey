import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "jonnhyortega@gmail.com";
  const password = "414437";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("No user found");
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  console.log("Match:", match);
}

main().catch(console.error).finally(() => prisma.$disconnect());
