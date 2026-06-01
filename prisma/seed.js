const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@pabloasorey.cloud';
  const password = await bcrypt.hash('entrenamientopremium', 10);
  
  // Create an admin securely. Upsert prevents duplicate error if already created.
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Pablo Asorey Admin',
      password,
      role: 'ADMIN',
    },
  });

  console.log('✅ Base de datos iniciada con credenciales administrador.');
  console.log(`Email de Admin: ${admin.email}`);
  console.log(`Password (solo lo verás aquí una vez): entrenamientopremium`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
