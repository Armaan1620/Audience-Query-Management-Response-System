export type UserRole = 'agent' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}
