import type { User } from "../../types/user.types";

interface UserTableProps {
  users: User[];
  onView: (userId: number) => void;
  onPrefetch: (userId: number) => void;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
  onStatusChange?: (userId: number, status: User["status"]) => void;
  statusUpdatingUserId?: number | null;
}

function UserTable({
  users,
  onView,
  onPrefetch,
  onEdit,
  onDelete,
}: UserTableProps) {
  if (users.length === 0) {
    return <div className="user-table-empty">No users found.</div>;
  }

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Tenant</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const fullName = `${user.firstName} ${user.lastName}`;

            return (
              <tr key={user.id}>
                <td>
                  <img
                    className="user-avatar"
                    src={user.image}
                    alt={fullName}
                  />
                </td>

                <td>
                  <strong className="user-name">{fullName}</strong>
                </td>

                <td>
                  <span className="user-email">{user.email}</span>
                </td>

                <td>
                  <span className="user-role">{user.role}</span>
                </td>

                <td>
                  <span className="user-tenant">{user.tenantName}</span>
                </td>

                <td>
                  <span
                    className={`user-status user-status-${user.status.toLowerCase()}`}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  <div className="user-table-actions">
                    <button
                      type="button"
                      onMouseEnter={() => onPrefetch(user.id)}
                      onFocus={() => onPrefetch(user.id)}
                      onClick={() => onView(user.id)}
                    >
                      View
                    </button>

                    <button type="button" onClick={() => onEdit(user.id)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-action"
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
