import { Prisma } from '@prisma/client';

export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNo?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNo?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
} 