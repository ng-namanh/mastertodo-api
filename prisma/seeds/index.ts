import { PrismaClient } from '@prisma/client';
import seedTodos from './seed-todos';
import seedUsers from './seed-users';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    // Seed users first
    await seedUsers();

    // Then seed todos
    await seedTodos();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
