export interface DashboardStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalTenants: number;
  revenue: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export interface TenantStatistics {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
}

export interface RecentActivity {
  id: number;
  userId: number;
  action: string;
  description: string;
  timestamp: string;
}

export interface DashboardApiResponse {
  dashboard: DashboardStatistics;
  userStatistics: UserStatistics;
  tenantStatistics: TenantStatistics;
  recentActivity: RecentActivity[];
}
