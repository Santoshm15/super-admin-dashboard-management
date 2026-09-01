export type TenantStatus = "Active" | "Inactive" | "Suspended";

export type TenantPlan = "Free" | "Basic" | "Pro" | "Enterprise";

export interface Tenant {
  id: number;
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
  userCount: number;
  createdAt: string;
}

export interface TenantListParams {
  search?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  page?: number;
  limit?: number;
}

export interface TenantsResponse {
  tenants: Tenant[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateTenantInput {
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
}

export interface UpdateTenantInput {
  id: number;
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
}
