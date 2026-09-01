import { queryOptions } from "@tanstack/react-query";

import {
  getDashboardStatistics,
  getUserStatistics,
  getTenantStatistics,
  getRecentActivity,
} from "../api/analytics.api";

import { queryKeys } from "./queryKeys";

export const dashboardStatisticsQuery = () =>
  queryOptions({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: getDashboardStatistics,

    select: (data) => ({
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      inactiveUsers: data.inactiveUsers,
      totalTenants: data.totalTenants,
      revenue: data.revenue,
    }),

    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const userStatisticsQuery = () =>
  queryOptions({
    queryKey: queryKeys.analytics.users,
    queryFn: getUserStatistics,

    select: (data) => ({
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      inactiveUsers: data.inactiveUsers,
    }),

    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const tenantStatisticsQuery = () =>
  queryOptions({
    queryKey: queryKeys.analytics.tenants,
    queryFn: getTenantStatistics,

    select: (data) => ({
      totalTenants: data.totalTenants,
      activeTenants: data.activeTenants,
      inactiveTenants: data.inactiveTenants,
    }),

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const recentActivityQuery = () =>
  queryOptions({
    queryKey: ["analytics", "recentActivity"] as const,
    queryFn: getRecentActivity,

    select: (data) => data.slice(0, 5),

    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
