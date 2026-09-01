import { queryOptions } from "@tanstack/react-query";

import {
  getTenantById,
  getTenants,
  getUsersByTenant,
} from "../api/tenants.api";

import type { TenantListParams } from "../types/tenant.types";

import { queryKeys } from "./queryKeys";

export const tenantsQuery = (params: TenantListParams = {}) =>
  queryOptions({
    queryKey: queryKeys.tenants.list(params),

    queryFn: ({ signal }) =>
      getTenants({
        ...params,
        signal,
      }),

    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

export const tenantDetailsQuery = (tenantId: number) =>
  queryOptions({
    queryKey: queryKeys.tenants.detail(tenantId),

    queryFn: ({ signal }) => getTenantById(tenantId, signal),

    enabled: !!tenantId,

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

export const tenantUsersQuery = (tenantId: number) =>
  queryOptions({
    queryKey: ["tenantUsers", tenantId],

    queryFn: ({ signal }) => getUsersByTenant(tenantId, signal),

    enabled: !!tenantId,

    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });
