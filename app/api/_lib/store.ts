import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string; name: string; email: string; password: string; role: string; createdAt: string;
}
export interface Task {
  id: string; title: string; description?: string; status: string; priority: string;
  category: string; dueDate?: string; createdAt: string; userId: string;
}

// Module-level globals persist across requests in the same Vercel instance
const globalStore = globalThis as typeof globalThis & { _users?: User[]; _tasks?: Task[] };

if (!globalStore._users) {
  const adminId = uuidv4();
  const userId = uuidv4();
  globalStore._users = [
    { id: adminId, name: 'Admin User', email: 'admin@taskflow.com', password: bcrypt.hashSync('admin123', 10), role: 'admin', createdAt: new Date().toISOString() },
    { id: userId,  name: 'John Doe',   email: 'user@taskflow.com',  password: bcrypt.hashSync('user123', 10),  role: 'user',  createdAt: new Date().toISOString() },
  ];
  globalStore._tasks = [
    { id: uuidv4(), title: 'Design landing page',    description: 'Create wireframes and mockups', status: 'todo',        priority: 'high',   category: 'Design',  createdAt: new Date().toISOString(), dueDate: '2025-07-20', userId },
    { id: uuidv4(), title: 'Setup database schema',  description: 'Define tables and relationships', status: 'in-progress', priority: 'high',   category: 'Backend', createdAt: new Date().toISOString(), dueDate: '2025-07-18', userId },
    { id: uuidv4(), title: 'Write unit tests',       description: 'Cover all API endpoints',        status: 'todo',        priority: 'medium', category: 'Testing', createdAt: new Date().toISOString(), dueDate: '2025-07-25', userId: adminId },
    { id: uuidv4(), title: 'Deploy to production',   description: 'Setup CI/CD pipeline',           status: 'done',        priority: 'low',    category: 'DevOps',  createdAt: new Date().toISOString(), dueDate: '2025-07-10', userId: adminId },
  ];
}

export const users: User[] = globalStore._users!;
export const tasks: Task[] = globalStore._tasks!;
