export type Role = 'ADMIN' | 'TEACHER' | 'HOMEROOM_TEACHER' | 'STUDENT' | 'FINANCE';
export type Gender = 'MALE' | 'FEMALE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  gender?: Gender;
  birthDate?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  classId?: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  homeroomClassId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  gender?: Gender;
  birthDate?: string;
  birthPlace?: string;
  avatar?: string;
  title?: string;
  teachingStyle?: string;
  hobby?: string;
  isActive: boolean;
  createdAt: string;
  student?: StudentProfile | null;
  teacher?: TeacherProfile | null;
}

export interface TokenResponse {
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  gender?: Gender;
  birthDate?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}