import { PrismaClient, Subtask, Todo, User } from '@prisma/client';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  createUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    return await this.prisma.user.create({
      data: user
    });
  };

  getUserById = async (id: number): Promise<User | null> => {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  };

  getUserByEmail = async (email: string): Promise<User | null> => {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  };

  getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return users;
  };

  createTodo = async (data: {
    title: string;
    description?: string;
    dueDate: string;
    reminderDate?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    starred?: boolean;
    creatorId: number;
    assignedTo?: number[];
    subtasks?: { title: string; completed?: boolean }[];
  }): Promise<Todo & { assignedTo: User[]; subtasks: Subtask[] }> => {
    return await this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : undefined,
        status: data.status,
        priority: data.priority,
        starred: data.starred,
        creator: { connect: { id: data.creatorId } },
        assignedTo: data.assignedTo ? { connect: data.assignedTo.map(id => ({ id })) } : undefined,
        subtasks: data.subtasks ? { create: data.subtasks } : undefined,
      },
      include: { assignedTo: true, subtasks: true }
    });
  };

  getTodoById = async (id: number): Promise<(Todo & { assignedTo: User[]; subtasks: Subtask[] }) | null> => {
    return await this.prisma.todo.findUnique({
      where: { id },
      include: { assignedTo: true, subtasks: true }
    });
  };

  getTodosByUserId = async (userId: number): Promise<(Todo & { assignedTo: User[]; subtasks: Subtask[] })[]> => {
    return await this.prisma.todo.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { assignedTo: { some: { id: userId } } }
        ]
      },
      include: { assignedTo: true, subtasks: true },
      orderBy: { createdAt: 'desc' }
    });
  };

  getAllTodos = async (filters?: {
    status?: string[];
    assignedTo?: number[];
    starred?: boolean;
    priority?: string[];
  }): Promise<any[]> => {
    const where: any = {};

    // Status filter
    if (filters?.status && filters.status.length > 0 && !filters.status.includes('all')) {
      where.status = { in: filters.status };
    }

    // Assigned users filter
    if (filters?.assignedTo && filters.assignedTo.length > 0) {
      where.assignedTo = { some: { id: { in: filters.assignedTo } } };
    }

    // Starred filter
    if (filters?.starred !== undefined) {
      where.starred = filters.starred;
    }

    // Priority filter
    if (filters?.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    return await this.prisma.todo.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true
          }
        },
        subtasks: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  };

  updateTodo = async (id: number, updates: {
    title?: string;
    description?: string;
    dueDate?: string;
    reminderDate?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    starred?: boolean;
    assignedTo?: number[];
    subtasks?: { id?: number; title: string; completed?: boolean }[];
  }): Promise<Todo & { assignedTo: User[]; subtasks: Subtask[] } | null> => {
    // Update main fields
    const todo = await this.prisma.todo.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        reminderDate: updates.reminderDate ? new Date(updates.reminderDate) : undefined,
        status: updates.status,
        priority: updates.priority,
        starred: updates.starred,
        assignedTo: updates.assignedTo ? { set: updates.assignedTo.map(id => ({ id })) } : undefined,
      },
      include: { assignedTo: true, subtasks: true }
    });
    // Handle subtasks update (optional: implement full CRUD for subtasks)
    return todo;
  };

  deleteTodo = async (id: number): Promise<boolean> => {
    try {
      await this.prisma.todo.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  close = async (): Promise<void> => {
    await this.prisma.$disconnect();
  };
} 