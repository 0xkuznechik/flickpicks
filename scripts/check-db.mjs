import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to the database to check for tables...');
  try {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`;
    if (tables.length > 0) {
      console.log('Tables found in the "public" schema:');
      console.table(tables.map(t => ({ name: t.tablename })));
    } else {
      console.log('No tables found in the "public" schema.');
    }
  } catch (e) {
    console.error('An error occurred while trying to query the database:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
