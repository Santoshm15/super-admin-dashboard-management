import type { UserListParams } from "../types/user.types";
import type { TenantListParams } from "../types/tenant.types";

export const queryKeys = {
  analytics: {
    dashboard: ["analytics", "dashboard"] as const,
    users: ["analytics", "users"] as const,
    tenants: ["analytics", "tenants"] as const,
  },

  users: {
    all: ["users"] as const,

    lists: ["users", "list"] as const,

    list: (params: UserListParams = {}) =>
      [
        "users",
        "list",
        {
          search: params.search ?? "",
          role: params.role ?? "",
          status: params.status ?? "",
          tenantId: params.tenantId ?? null,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        },
      ] as const,

    details: ["users", "detail"] as const,

    detail: (userId: number) => ["users", "detail", userId] as const,

    activities: ["users", "activity"] as const,

    activity: (userId: number) => ["users", "activity", userId] as const,
  },

  tenants: {
    all: ["tenants"] as const,

    lists: ["tenants", "list"] as const,

    list: (params: TenantListParams = {}) =>
      [
        "tenants",
        "list",
        {
          search: params.search ?? "",
          plan: params.plan ?? "",
          status: params.status ?? "",
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        },
      ] as const,

    details: ["tenants", "detail"] as const,

    detail: (tenantId: number) => ["tenants", "detail", tenantId] as const,

    users: ["tenants", "users"] as const,

    usersByTenant: (tenantId: number) => ["tenantUsers", tenantId] as const,
  },
};
