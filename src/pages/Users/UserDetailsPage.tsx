import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { userActivityQuery, userDetailsQuery } from "../../queries/userQueries";

import { queryKeys } from "../../queries/queryKeys";

import type { User, UsersResponse } from "../../types/user.types";

function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const userId = Number(id);

  const queryClient = useQueryClient();

  const userQuery = useQuery({
    ...userDetailsQuery(userId),

    placeholderData: (): User | undefined => {
      const cachedUserLists = queryClient.getQueriesData<UsersResponse>({
        queryKey: queryKeys.users.lists,
      });

      for (const [, data] of cachedUserLists) {
        const cachedUser = data?.users.find((user) => user.id === userId);

        if (cachedUser) {
          return cachedUser;
        }
      }

      return undefined;
    },
  });

  const activityQuery = useQuery({
    ...userActivityQuery(userId),
    enabled: !!userId && userQuery.isSuccess,
  });

  if (!id || Number.isNaN(userId)) {
    return (
      <main className="user-details-page">
        <div className="user-details-error">
          <h2>Invalid User ID</h2>

          <p>The selected user ID is not valid.</p>

          <Link to="/users">Back to Users</Link>
        </div>
      </main>
    );
  }

  if (userQuery.isLoading) {
    return (
      <main className="user-details-page">
        <div className="user-details-loading">Loading user details...</div>
      </main>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <main className="user-details-page">
        <div className="user-details-error">
          <h2>Unable to load user</h2>

          <p>Something went wrong while loading the user details.</p>

          <Link to="/users">Back to Users</Link>
        </div>
      </main>
    );
  }

  const user = userQuery.data;

  return (
    <main className="user-details-page">
      <div className="user-details-topbar">
        <Link to="/users" className="back-to-users">
          ← Back to Users
        </Link>

        {userQuery.isFetching && (
          <span className="user-details-updating">Updating...</span>
        )}
      </div>

      <section className="user-profile-card">
        <div className="user-profile-main">
          <img
            src={user.image}
            alt={`${user.firstName} ${user.lastName}`}
            className="user-profile-image"
          />

          <div className="user-profile-heading">
            <h1>
              {user.firstName} {user.lastName}
            </h1>

            <p>@{user.username}</p>

            <span
              className={`user-details-status ${user.status.toLowerCase()}`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </section>

      <section className="user-details-grid">
        <div className="user-details-card">
          <div className="user-details-card-header">
            <h2>Profile</h2>
          </div>

          <div className="user-details-list">
            <div className="user-detail-item">
              <span>Name</span>

              <strong>
                {user.firstName} {user.lastName}
              </strong>
            </div>

            <div className="user-detail-item">
              <span>Email</span>

              <strong>{user.email}</strong>
            </div>

            <div className="user-detail-item">
              <span>Phone</span>

              <strong>{user.phone || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>Role</span>

              <strong>{user.role}</strong>
            </div>

            <div className="user-detail-item">
              <span>Tenant</span>

              <strong>{user.tenantName}</strong>
            </div>

            <div className="user-detail-item">
              <span>Status</span>

              <strong>{user.status}</strong>
            </div>
          </div>
        </div>

        <div className="user-details-card">
          <div className="user-details-card-header">
            <h2>Company</h2>
          </div>

          <div className="user-details-list">
            <div className="user-detail-item">
              <span>Company</span>

              <strong>{user.company.name || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>Title</span>

              <strong>{user.company.title || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>Department</span>

              <strong>{user.company.department || "Not available"}</strong>
            </div>
          </div>
        </div>

        <div className="user-details-card">
          <div className="user-details-card-header">
            <h2>Address</h2>
          </div>

          <div className="user-details-list">
            <div className="user-detail-item">
              <span>Address</span>

              <strong>{user.address.address || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>City</span>

              <strong>{user.address.city || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>State</span>

              <strong>{user.address.state || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>Postal Code</span>

              <strong>{user.address.postalCode || "Not available"}</strong>
            </div>

            <div className="user-detail-item">
              <span>Country</span>

              <strong>{user.address.country || "Not available"}</strong>
            </div>
          </div>
        </div>

        <div className="user-details-card">
          <div className="user-details-card-header">
            <h2>Recent Activity</h2>
          </div>

          {activityQuery.isLoading && (
            <div className="user-activity-loading">Loading activity...</div>
          )}

          {activityQuery.isError && (
            <div className="user-activity-error">Unable to load activity.</div>
          )}

          {activityQuery.data && activityQuery.data.length > 0 && (
            <div className="user-activity-list">
              {activityQuery.data.map((activity) => (
                <div key={activity.id} className="user-activity-item">
                  <div className="user-activity-dot" />

                  <div>
                    <strong>{activity.action}</strong>

                    <p>{activity.description}</p>

                    <small>
                      {new Date(activity.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activityQuery.data && activityQuery.data.length === 0 && (
            <div className="user-activity-empty">No activity found.</div>
          )}
        </div>
      </section>
    </main>
  );
}

export default UserDetailsPage;
