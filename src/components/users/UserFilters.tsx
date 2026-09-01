import type {
  UserListParams,
  UserRole,
  UserStatus,
} from "../../types/user.types";

interface UserFiltersProps {
  filters: UserListParams;
  onChange: (filters: UserListParams) => void;
}

const roles: UserRole[] = ["Admin", "Manager", "User", "Viewer"];

const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];

function UserFilters({ filters, onChange }: UserFiltersProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: event.target.value,
      page: 1,
    });
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    onChange({
      ...filters,
      role: value ? (value as UserRole) : undefined,
      page: 1,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    onChange({
      ...filters,
      status: value ? (value as UserStatus) : undefined,
      page: 1,
    });
  };

  const handleTenantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    onChange({
      ...filters,
      tenantId: value ? Number(value) : undefined,
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
    <section className="user-filters">
      <div className="user-filter-group search-filter">
        <label htmlFor="user-search">Search User</label>

        <input
          id="user-search"
          type="search"
          value={filters.search ?? ""}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
        />
      </div>

      <div className="user-filter-group">
        <label htmlFor="user-role">Role</label>

        <select
          id="user-role"
          value={filters.role ?? ""}
          onChange={handleRoleChange}
        >
          <option value="">All Roles</option>

          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="user-filter-group">
        <label htmlFor="user-status">Status</label>

        <select
          id="user-status"
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

      <div className="user-filter-group">
        <label htmlFor="user-tenant">Tenant</label>

        <input
          id="user-tenant"
          type="number"
          min="1"
          value={filters.tenantId ?? ""}
          onChange={handleTenantChange}
          placeholder="Tenant ID"
        />
      </div>

      <div className="user-filter-actions">
        <button type="button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </section>
  );
}

export default UserFilters;
