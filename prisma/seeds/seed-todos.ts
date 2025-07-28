import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TodoData {
  id: string;
  title: string;
  assignedTo: string[];
  dueDate: Date;
  status: "In Progress" | "Pending" | "Completed";
  priority: "High" | "Medium" | "Low";
  subtasks: { completed: number; total: number };
  starred: boolean;
}

const initialTodos: TodoData[] = [
  {
    id: "1",
    title: "Design homepage layout",
    assignedTo: ["Emily Carter", "Liam Walker"],
    dueDate: new Date("2023-06-05"),
    status: "In Progress",
    priority: "High",
    subtasks: { completed: 1, total: 2 },
    starred: true,
  },
  {
    id: "2",
    title: "Conduct user interviews",
    assignedTo: ["Liam Walker"],
    dueDate: new Date("2023-06-12"),
    status: "Pending",
    priority: "Medium",
    subtasks: { completed: 1, total: 2 },
    starred: false,
  },
  {
    id: "3",
    title: "Write unit tests",
    assignedTo: ["Sophie Lee"],
    dueDate: new Date("2023-06-07"),
    status: "In Progress",
    priority: "High",
    subtasks: { completed: 0, total: 2 },
    starred: true,
  },
  {
    id: "4",
    title: "Prepare launch checklist",
    assignedTo: ["Daniel Kim", "Olivia Adams"],
    dueDate: new Date("2023-06-20"),
    status: "Pending",
    priority: "Low",
    subtasks: { completed: 0, total: 1 },
    starred: false,
  },
  {
    id: "5",
    title: "Update privacy policy",
    assignedTo: ["Olivia Adams"],
    dueDate: new Date("2023-06-14"),
    status: "In Progress",
    priority: "Medium",
    subtasks: { completed: 1, total: 2 },
    starred: false,
  },
  {
    id: "6",
    title: "Deploy to staging",
    assignedTo: ["Noah Bennett"],
    dueDate: new Date("2023-06-02"),
    status: "Completed",
    priority: "High",
    subtasks: { completed: 2, total: 2 },
    starred: true,
  },
  {
    id: "7",
    title: "Organize team retro",
    assignedTo: ["Mia Turner", "Olivia Adams"],
    dueDate: new Date("2023-06-10"),
    status: "Pending",
    priority: "Low",
    subtasks: { completed: 0, total: 2 },
    starred: false,
  },
  {
    id: "8",
    title: "Refactor dashboard UI",
    assignedTo: ["Lucas Evans", "Mia Turner", "Olivia Adams"],
    dueDate: new Date("2023-06-18"),
    status: "In Progress",
    priority: "High",
    subtasks: { completed: 1, total: 2 },
    starred: true,
  },
];

// Mapping frontend status to backend enum
const statusMapping = {
  "Pending": "PENDING",
  "In Progress": "IN_PROGRESS",
  "Completed": "COMPLETED"
} as const;

// Mapping frontend priority to backend enum
const priorityMapping = {
  "High": "HIGH",
  "Medium": "MEDIUM",
  "Low": "LOW"
} as const;

async function seedTodos() {
  console.log('Starting todo seeding...');

  // Get all users first
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log('No users found. Please run user seeding first.');
    return;
  }

  // Create a map of usernames to user IDs
  const userMap = new Map<string, number>();
  users.forEach(user => {
    userMap.set(user.username, user.id);
  });

  // Use the first user as the creator for all todos (Emily Carter)
  const creatorUser = users.find(u => u.username === "Emily Carter") || users[0];

  for (const todoData of initialTodos) {
    try {
      // Check if todo already exists
      const existingTodo = await prisma.todo.findFirst({
        where: { title: todoData.title }
      });

      if (existingTodo) {
        console.log(`Todo "${todoData.title}" already exists, skipping...`);
        continue;
      }

      // Get assigned user IDs
      const assignedUserIds = todoData.assignedTo
        .map(userName => userMap.get(userName))
        .filter((id): id is number => id !== undefined);

      if (assignedUserIds.length === 0) {
        console.log(`No valid users found for todo "${todoData.title}", skipping...`);
        continue;
      }

      // Create the todo
      const todo = await prisma.todo.create({
        data: {
          title: todoData.title,
          description: `Todo: ${todoData.title}`,
          dueDate: todoData.dueDate,
          status: statusMapping[todoData.status],
          priority: priorityMapping[todoData.priority],
          starred: todoData.starred,
          creatorId: creatorUser.id,
          assignedTo: {
            connect: assignedUserIds.map(id => ({ id }))
          }
        },
      });

      // Create subtasks
      const subtasks: Array<{
        title: string;
        completed: boolean;
        todoId: number;
      }> = [];
      for (let i = 1; i <= todoData.subtasks.total; i++) {
        const isCompleted = i <= todoData.subtasks.completed;
        subtasks.push({
          title: `Subtask ${i} for ${todoData.title}`,
          completed: isCompleted,
          todoId: todo.id
        });
      }

      if (subtasks.length > 0) {
        await prisma.subtask.createMany({
          data: subtasks
        });
      }

      console.log(`Created todo: "${todo.title}" with ${subtasks.length} subtasks`);
    } catch (error) {
      console.error(`Error creating todo "${todoData.title}":`, error);
    }
  }

  console.log('Todo seeding completed!');
}

async function main() {
  try {
    await seedTodos();
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

export default seedTodos;
