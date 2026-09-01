import type { TenantStatistics as TenantStatisticsData } from "../../types/analytics.types";

interface TenantStatisticsProps {
  data: TenantStatisticsData;
}

function TenantStatistics({ data }: TenantStatisticsProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <h2>Tenant Statistics</h2>
      </div>

      <div className="statistics-grid">
        <div className="statistics-item">
          <span className="statistics-label">Total Tenants</span>
          <strong className="statistics-value">{data.totalTenants}</strong>
        </div>

        <div className="statistics-item">
          <span className="statistics-label">Active Tenants</span>
          <strong className="statistics-value">{data.activeTenants}</strong>
        </div>

        <div className="statistics-item">
          <span className="statistics-label">Inactive Tenants</span>
          <strong className="statistics-value">{data.inactiveTenants}</strong>
        </div>
      </div>
    </section>
  );
}

export default TenantStatistics;
