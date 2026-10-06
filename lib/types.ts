export type Status = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type Role = 'admin' | 'user';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category: string;
  dueDate?: string;
  createdAt: string;
  userId: string;
  userName?: string;
}

export interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface AdminStats extends Stats {
  totalUsers: number;
  totalTasks: number;
  admins: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  taskCount?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
