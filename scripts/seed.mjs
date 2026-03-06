import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const initialUsers = [
  'user1@example.com',
  'user2@example.com',
  'admin@example.com',
  'lets.jam@gmail.com',
  'cindyjhlee@gmail.com',
	'mrwasa19@gmail.com',
	'janelle.myers90@gmail.com',
	'kieran.aulak@gmail.com',
	'cate@supinski.net',
	'jeremygarbellano@gmail.com',
	'chenkhuan@gmail.com',
];

const standardPassword = 'password123';

async function seed() {
  console.log('Seeding the database...');

  const hashedPassword = await bcrypt.hash(standardPassword, 12);

  for (const email of initialUsers) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        passwordMustBeChanged: true,
        username: email.split('@')[0], // a default username
      },
    });
    console.log(`Created/updated user: ${user.email}`);
  }

  // Make admin@example.com an admin
  const admin = await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { isAdmin: true },
  });
  console.log(`Made ${admin.email} an admin.`);


  console.log('Database seeded successfully.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
