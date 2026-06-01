import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Usuarios:", users);

  const students = await prisma.student.findMany();
  console.log("Estudiantes:", students);
}

main().catch(console.error).finally(() => prisma.$disconnect());
