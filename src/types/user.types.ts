export type UserStatus = "Active" | "Inactive" | "Suspended";

export type UserRole = "Admin" | "Manager" | "User" | "Viewer";

export interface UserCompany {
  name: string;
  title: string;
  department: string;
}

export interface UserAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  role: UserRole;
  tenantId: number;
  tenantName: string;
  status: UserStatus;
  company: UserCompany;
  address: UserAddress;
}

export interface UserListParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  tenantId?: number;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  tenantId: number;
  status: UserStatus;
}

export interface UpdateUserInput {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  tenantId: number;
  status: UserStatus;
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  description: string;
  timestamp: string;
}
