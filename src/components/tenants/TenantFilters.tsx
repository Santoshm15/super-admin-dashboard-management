import type {
  TenantListParams,
  TenantPlan,
  TenantStatus,
} from "../../types/tenant.types";

interface TenantFiltersProps {
  filters: TenantListParams;
  onChange: (filters: TenantListParams) => void;
}

const plans: TenantPlan[] = ["Free", "Basic", "Pro", "Enterprise"];

const statuses: TenantStatus[] = ["Active", "Inactive", "Suspended"];

function TenantFilters({ filters, onChange }: TenantFiltersProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: event.target.value,
      page: 1,
    });
  };

  const handlePlanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    onChange({
      ...filters,
      plan: value ? (value as TenantPlan) : undefined,
      page: 1,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    onChange({
      ...filters,
      status: value ? (value as TenantStatus) : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit ?? 10,
    });
  };

  return (
    <section className="tenant-filters">
      <div className="tenant-filter-group tenant-search-filter">
        <label htmlFor="tenant-search">Search Tenant</label>

        <input
          id="tenant-search"
          type="search"
          value={filters.search ?? ""}
          onChange={handleSearchChange}
          placeholder="Search tenant..."
        />
      </div>

      <div className="tenant-filter-group">
        <label htmlFor="tenant-plan">Plan</label>

        <select
          id="tenant-plan"
          value={filters.plan ?? ""}
          onChange={handlePlanChange}
        >
          <option value="">All Plans</option>

          {plans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
      </div>

      <div className="tenant-filter-group">
        <label htmlFor="tenant-status">Status</label>

        <select
          id="tenant-status"
          value={filters.status ?? ""}
          onChange={handleStatusChange}
        >
          <option value="">All Statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="tenant-filter-actions">
        <button type="button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </section>
  );
}

export default TenantFilters;
