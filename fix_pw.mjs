import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "jonnhyortega@gmail.com";
  
  const student = await prisma.student.findFirst({
    where: { email }
  });

  if (student && student.generatedPassword) {
    const hashedPassword = await bcrypt.hash(student.generatedPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    console.log("Contraseña arreglada para", email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
