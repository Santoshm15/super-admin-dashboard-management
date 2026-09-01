import { useQuery } from "@tanstack/react-query";

import StatCard from "../../components/dashboard/StatCard";
import UserStatistics from "../../components/dashboard/UserStatistics";
import TenantStatistics from "../../components/dashboard/TenantStatistics";

import {
  dashboardStatisticsQuery,
  userStatisticsQuery,
  tenantStatisticsQuery,
  recentActivityQuery,
} from "../../queries/analyticsQueries";

function DashboardPage() {
  const dashboardQuery = useQuery(dashboardStatisticsQuery());

  const userStatisticsQueryResult = useQuery(userStatisticsQuery());

  const tenantStatisticsQueryResult = useQuery(tenantStatisticsQuery());

  const recentActivityQueryResult = useQuery(recentActivityQuery());

  const isInitialLoading =
    dashboardQuery.isLoading ||
    userStatisticsQueryResult.isLoading ||
    tenantStatisticsQueryResult.isLoading ||
    recentActivityQueryResult.isLoading;

  const hasError =
    dashboardQuery.isError ||
    userStatisticsQueryResult.isError ||
    tenantStatisticsQueryResult.isError ||
    recentActivityQueryResult.isError;

  const isFetching =
    dashboardQuery.isFetching ||
    userStatisticsQueryResult.isFetching ||
    tenantStatisticsQueryResult.isFetching ||
    recentActivityQueryResult.isFetching;

  if (isInitialLoading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">Loading dashboard...</div>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <h2>Unable to load dashboard</h2>

          <p>Something went wrong while loading the dashboard data.</p>

          <button
            type="button"
            onClick={() => {
              void dashboardQuery.refetch();
              void userStatisticsQueryResult.refetch();
              void tenantStatisticsQueryResult.refetch();
              void recentActivityQueryResult.refetch();
            }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (
    !dashboardQuery.data ||
    !userStatisticsQueryResult.data ||
    !tenantStatisticsQueryResult.data ||
    !recentActivityQueryResult.data
  ) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-empty">No dashboard data available.</div>
      </main>
    );
  }

  const dashboard = dashboardQuery.data;
  const recentActivity = recentActivityQueryResult.data;

  const refreshDashboard = () => {
    void dashboardQuery.refetch();
    void userStatisticsQueryResult.refetch();
    void tenantStatisticsQueryResult.refetch();
    void recentActivityQueryResult.refetch();
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Super Admin Dashboard</h1>

          <p>Monitor users, tenants, and system activity.</p>
        </div>

        <div className="dashboard-header-actions">
          {isFetching && (
            <span className="dashboard-updating">Updating...</span>
          )}

          <button
            type="button"
            onClick={refreshDashboard}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="dashboard-stats-grid">
        <StatCard
          title="Total Users"
          value={dashboard.totalUsers}
          description="All registered users"
        />

        <StatCard
          title="Active Users"
          value={dashboard.activeUsers}
          description="Currently active users"
        />

        <StatCard
          title="Total Tenants"
          value={dashboard.totalTenants}
          description="Registered tenants"
        />

        <StatCard
          title="Revenue"
          value={`$${dashboard.revenue.toLocaleString()}`}
          description="Subscription revenue"
        />
      </section>

      <UserStatistics data={userStatisticsQueryResult.data} />

      <TenantStatistics data={tenantStatisticsQueryResult.data} />

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Recent Activity</h2>
        </div>

        {recentActivity.length === 0 ? (
          <div className="activity-empty">No recent activity available.</div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-icon">{activity.userId}</div>

                <div className="activity-content">
                  <strong>{activity.action}</strong>

                  <p>{activity.description}</p>

                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DashboardPage;
