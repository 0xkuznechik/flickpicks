import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`User not found: ${email}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash, passwordMustBeChanged: true },
  });

  console.log(`Password reset for ${email}. They will be prompted to change it on next login.`);
}

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/reset-password.mjs <email>');
  process.exit(1);
}

resetPassword(email)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
