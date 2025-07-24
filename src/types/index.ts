import { Context } from 'koa';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  dueDate: string; // ISO string
  reminderDate?: string; // ISO string
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
  assignedTo?: number[]; // user ids
  subtasks?: { title: string; completed?: boolean }[];
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  reminderDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  starred?: boolean;
  assignedTo?: number[];
  subtasks?: { id?: number; title: string; completed?: boolean }[];
}

export interface AuthContext extends Context {
  user?: Omit<User, 'password'>;
}

export interface JwtPayload {
  userId: number;
  email: string;
} 