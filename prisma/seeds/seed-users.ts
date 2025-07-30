import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  'Admin',
  'Test',
  "Emily Carter",
  "Liam Walker",
  "Sophie Lee",
  "Daniel Kim",
  "Olivia Adams",
  "Noah Bennett",
  "Mia Turner",
  "Lucas Evans",
];

async function seedUsers() {
  console.log('Starting user seeding...');

  // Hash password for all users (using a default password)
  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  for (const userName of users) {
    const email = `${userName.toLowerCase().replace(' ', '.')}@example.com`;

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log(`User ${userName} already exists, skipping...`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userName,
          email,
          password: hashedPassword,
        },
      });

      console.log(`Created user: ${user.username} (${user.email})`);
    } catch (error) {
      console.error(`Error creating user ${userName}:`, error);
    }
  }

  console.log('User seeding completed!');
}

async function main() {
  try {
    await seedUsers();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default seedUsers;
