import type { Tenant } from "../../types/tenant.types";

interface TenantTableProps {
  tenants: Tenant[];
  onView: (tenantId: number) => void;
  onEdit: (tenantId: number) => void;
  onDelete: (tenantId: number) => void;
}

function TenantTable({ tenants, onView, onEdit, onDelete }: TenantTableProps) {
  if (tenants.length === 0) {
    return <div className="tenant-table-empty">No tenants found.</div>;
  }

  return (
    <div className="tenant-table-wrapper">
      <table className="tenant-table">
        <thead>
          <tr>
            <th>Tenant ID</th>
            <th>Tenant Name</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Users</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td>
                <span className="tenant-id">#{tenant.id}</span>
              </td>

              <td>
                <strong className="tenant-name">{tenant.name}</strong>
              </td>

              <td>
                <span className="tenant-plan">{tenant.plan}</span>
              </td>

              <td>
                <span
                  className={`tenant-status tenant-status-${tenant.status.toLowerCase()}`}
                >
                  {tenant.status}
                </span>
              </td>

              <td>
                <span className="tenant-user-count">{tenant.userCount}</span>
              </td>

              <td>
                <span className="tenant-created-date">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </span>
              </td>

              <td>
                <div className="tenant-table-actions">
                  <button type="button" onClick={() => onView(tenant.id)}>
                    View
                  </button>

                  <button type="button" onClick={() => onEdit(tenant.id)}>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-action"
                    onClick={() => onDelete(tenant.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TenantTable;
