import type {
  DashboardStatistics,
  UserStatistics,
  TenantStatistics,
  RecentActivity,
} from "../types/analytics.types";

const API_URL = "https://dummyjson.com";

export const getDashboardStatistics =
  async (): Promise<DashboardStatistics> => {
    const response = await fetch(`${API_URL}/users`);

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard statistics");
    }

    const data = await response.json();

    const users = data.users ?? [];

    const totalUsers = data.total ?? users.length;

    const activeUsers = users.filter(
      (user: { age?: number }) => (user.age ?? 0) >= 18,
    ).length;

    const inactiveUsers = Math.max(totalUsers - activeUsers, 0);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalTenants: 85,
      revenue: 125000,
    };
  };

export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch user statistics");
  }

  const data = await response.json();

  const users = data.users ?? [];

  const totalUsers = data.total ?? users.length;

  const activeUsers = users.filter(
    (user: { age?: number }) => (user.age ?? 0) >= 18,
  ).length;

  const inactiveUsers = Math.max(totalUsers - activeUsers, 0);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
  };
};

export const getTenantStatistics = async (): Promise<TenantStatistics> => {
  return {
    totalTenants: 85,
    activeTenants: 72,
    inactiveTenants: 13,
  };
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
  const response = await fetch(`${API_URL}/users?limit=5`);

  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  const data = await response.json();

  return (data.users ?? []).map(
    (user: { id: number; firstName: string; lastName: string }) => ({
      id: user.id,
      userId: user.id,
      action: "User activity",
      description: `${user.firstName} ${user.lastName} activity`,
      timestamp: new Date().toISOString(),
    }),
  );
};
