import type { UserStatistics as UserStatisticsData } from "../../types/analytics.types";

interface UserStatisticsProps {
  data: UserStatisticsData;
}

function UserStatistics({ data }: UserStatisticsProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <h2>User Statistics</h2>
      </div>

      <div className="statistics-grid">
        <div className="statistics-item">
          <span className="statistics-label">Total Users</span>
          <strong className="statistics-value">{data.totalUsers}</strong>
        </div>

        <div className="statistics-item">
          <span className="statistics-label">Active Users</span>
          <strong className="statistics-value">{data.activeUsers}</strong>
        </div>

        <div className="statistics-item">
          <span className="statistics-label">Inactive Users</span>
          <strong className="statistics-value">{data.inactiveUsers}</strong>
        </div>
      </div>
    </section>
  );
}

export default UserStatistics;
