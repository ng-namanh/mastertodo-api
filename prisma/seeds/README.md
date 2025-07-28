# Database Seeding Scripts

This directory contains seeding scripts to populate the database with initial data.

## Available Scripts

### Main Seed Script
```bash
npm run db:seed
```
Runs both user and todo seeding scripts in the correct order.

### Individual Seed Scripts

#### Seed Users
```bash
npm run db:seed:users
```
Creates 8 demo users:
- Emily Carter (emily.carter@example.com)
- Liam Walker (liam.walker@example.com)
- Sophie Lee (sophie.lee@example.com)
- Daniel Kim (daniel.kim@example.com)
- Olivia Adams (olivia.adams@example.com)
- Noah Bennett (noah.bennett@example.com)
- Mia Turner (mia.turner@example.com)
- Lucas Evans (lucas.evans@example.com)

All users have the default password: `password123`

#### Seed Todos
```bash
npm run db:seed:todos
```
Creates 8 demo todos with various priorities, statuses, and assignments based on the frontend sample data.

**Note**: Users must be seeded first before running the todo seeding script.

## Files

- `index.ts` - Main seeding script that runs both user and todo seeding
- `seed-users.ts` - Creates demo users
- `seed-todos.ts` - Creates demo todos with subtasks

## Prerequisites

1. Ensure your database is set up and running
2. Run `npm run db:generate` to generate Prisma client
3. Run `npm run db:migrate` to apply migrations

## Usage

1. **First time setup**: Run the main seed script
   ```bash
   npm run db:seed
   ```

2. **Seed only users**: If you only need to add users
   ```bash
   npm run db:seed:users
   ```

3. **Seed only todos**: If users already exist and you want to add todos
   ```bash
   npm run db:seed:todos
   ```

## Data Details

### Todo Data
The seeding creates 8 todos with the following characteristics:
- Various priorities (High, Medium, Low)
- Different statuses (Pending, In Progress, Completed)
- Multiple assignees per todo
- Subtasks with completion tracking
- Due dates and starred status

### User Data
Each user gets:
- Unique username and email
- Hashed password (`password123`)
- Timestamps for creation and updates

## Safety Features
- Scripts check for existing data to avoid duplicates
- Graceful error handling and logging
- Safe to run multiple times
