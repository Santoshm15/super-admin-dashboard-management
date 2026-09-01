import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import {
  tenantDetailsQuery,
  tenantUsersQuery,
} from "../../queries/tenantQueries";

import { queryKeys } from "../../queries/queryKeys";

import type { Tenant, TenantsResponse } from "../../types/tenant.types";

function TenantDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const queryClient = useQueryClient();

  const tenantId = Number(id);

  const tenantFromCache = queryClient
    .getQueriesData<TenantsResponse>({
      queryKey: queryKeys.tenants.lists,
    })
    .map(([, data]) => data)
    .find((data) => data?.tenants.some((tenant) => tenant.id === tenantId))
    ?.tenants.find((tenant) => tenant.id === tenantId);

  const tenantQuery = useQuery({
    ...tenantDetailsQuery(tenantId),

    initialData: tenantFromCache as Tenant | undefined,
  });

  const tenantUsersQueryResult = useQuery(tenantUsersQuery(tenantId));

  if (!id || Number.isNaN(tenantId)) {
    return (
      <main className="tenant-details-page">
        <div className="tenant-details-error">
          <h2>Invalid Tenant ID</h2>

          <p>The selected tenant ID is not valid.</p>

          <Link to="/tenants">Back to Tenants</Link>
        </div>
      </main>
    );
  }

  if (tenantQuery.isLoading) {
    return (
      <main className="tenant-details-page">
        <div className="tenant-details-loading">Loading tenant details...</div>
      </main>
    );
  }

  if (tenantQuery.isError || !tenantQuery.data) {
    return (
      <main className="tenant-details-page">
        <div className="tenant-details-error">
          <h2>Unable to load tenant</h2>

          <p>Something went wrong while loading the tenant details.</p>

          <Link to="/tenants">Back to Tenants</Link>
        </div>
      </main>
    );
  }

  const tenant = tenantQuery.data;

  return (
    <main className="tenant-details-page">
      <div className="tenant-details-topbar">
        <Link to="/tenants" className="back-to-tenants">
          ← Back to Tenants
        </Link>

        {tenantQuery.isFetching && (
          <span className="tenant-details-updating">Updating...</span>
        )}
      </div>

      <section className="tenant-profile-card">
        <div className="tenant-profile-heading">
          <div className="tenant-profile-icon">
            {tenant.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="tenant-details-eyebrow">Tenant</p>

            <h1>{tenant.name}</h1>

            <div className="tenant-profile-meta">
              <span
                className={`tenant-status tenant-status-${tenant.status.toLowerCase()}`}
              >
                {tenant.status}
              </span>

              <span className="tenant-plan">{tenant.plan}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="tenant-details-grid">
        <div className="tenant-details-card">
          <div className="tenant-details-card-header">
            <h2>Tenant Information</h2>
          </div>

          <div className="tenant-details-list">
            <div className="tenant-detail-item">
              <span>Tenant ID</span>
              <strong>{tenant.id}</strong>
            </div>

            <div className="tenant-detail-item">
              <span>Name</span>
              <strong>{tenant.name}</strong>
            </div>

            <div className="tenant-detail-item">
              <span>Plan</span>
              <strong>{tenant.plan}</strong>
            </div>

            <div className="tenant-detail-item">
              <span>Status</span>
              <strong>{tenant.status}</strong>
            </div>
          </div>
        </div>

        <div className="tenant-details-card">
          <div className="tenant-details-card-header">
            <h2>Usage</h2>
          </div>

          <div className="tenant-details-list">
            <div className="tenant-detail-item">
              <span>Total Users</span>
              <strong>{tenant.userCount ?? 0}</strong>
            </div>

            <div className="tenant-detail-item">
              <span>Created</span>

              <strong>
                {tenant.createdAt
                  ? new Date(tenant.createdAt).toLocaleDateString()
                  : "Not available"}
              </strong>
            </div>
          </div>
        </div>

        <div className="tenant-details-card">
          <div className="tenant-details-card-header">
            <h2>Tenant Users</h2>
          </div>

          {tenantUsersQueryResult.isLoading && (
            <div className="tenant-details-loading">
              Loading tenant users...
            </div>
          )}

          {tenantUsersQueryResult.isError && (
            <div className="tenant-details-error">
              <p>Unable to load tenant users.</p>
            </div>
          )}

          {tenantUsersQueryResult.data &&
            tenantUsersQueryResult.data.length === 0 && (
              <div className="tenant-details-loading">
                No users found for this tenant.
              </div>
            )}

          {tenantUsersQueryResult.data &&
            tenantUsersQueryResult.data.length > 0 && (
              <div className="tenant-details-list">
                {tenantUsersQueryResult.data.map((user) => (
                  <div key={user.id} className="tenant-detail-item">
                    <span>
                      {user.firstName} {user.lastName}
                    </span>

                    <strong>{user.email}</strong>
                  </div>
                ))}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

export default TenantDetailsPage;
