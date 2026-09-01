import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import TenantFilters from "../../components/tenants/TenantFilters";
import TenantTable from "../../components/tenants/TenantTable";
import TenantForm from "../../components/tenants/TenantForm";

import {
  createTenant,
  deleteTenant,
  updateTenant,
} from "../../api/tenants.api";

import { tenantDetailsQuery, tenantsQuery } from "../../queries/tenantQueries";

import { queryKeys } from "../../queries/queryKeys";

import type {
  CreateTenantInput,
  Tenant,
  TenantListParams,
} from "../../types/tenant.types";

function TenantsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TenantListParams>({
    page: 1,
    limit: 10,
  });

  const [showForm, setShowForm] = useState(false);

  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>();

  const tenantQuery = useQuery(tenantsQuery(filters));

  const createMutation = useMutation({
    mutationFn: createTenant,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.lists,
      });

      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTenant,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.lists,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.details,
      });

      setShowForm(false);
      setEditingTenant(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTenant,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.lists,
      });
    },
  });

  const handleCreate = () => {
    setEditingTenant(undefined);
    setShowForm(true);
  };

  const handleEdit = (tenantId: number) => {
    const tenant = tenantQuery.data?.tenants.find(
      (item) => item.id === tenantId,
    );

    if (!tenant) {
      return;
    }

    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleView = (tenantId: number) => {
    navigate(`/tenants/${tenantId}`);
  };

  const handlePrefetch = (tenantId: number) => {
    queryClient.prefetchQuery(tenantDetailsQuery(tenantId));
  };

  const handleDelete = (tenantId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tenant?",
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(tenantId);
  };

  const handleSubmit = (data: CreateTenantInput) => {
    if (editingTenant) {
      updateMutation.mutate({
        id: editingTenant.id,
        ...data,
      });

      return;
    }

    createMutation.mutate(data);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTenant(undefined);
  };

  const tenants = tenantQuery.data?.tenants ?? [];

  const total = tenantQuery.data?.total ?? 0;

  const currentPage = filters.page ?? 1;

  const pageSize = filters.limit ?? 10;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="tenants-page">
      <div className="tenants-page-header">
        <div>
          <p className="tenants-page-eyebrow">Tenant Management</p>

          <h1>Tenants</h1>

          <p className="tenants-page-description">
            Manage tenants, plans, statuses, and tenant information.
          </p>
        </div>

        <button
          type="button"
          className="tenant-create-button"
          onClick={handleCreate}
        >
          + Create Tenant
        </button>
      </div>

      {showForm ? (
        <section className="tenant-form-section">
          <TenantForm
            tenant={editingTenant}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </section>
      ) : (
        <>
          <TenantFilters filters={filters} onChange={setFilters} />

          {tenantQuery.isLoading && (
            <div className="tenant-page-message">Loading tenants...</div>
          )}

          {tenantQuery.isError && (
            <div className="tenant-page-message tenant-page-error">
              Unable to load tenants.
            </div>
          )}

          {!tenantQuery.isLoading && !tenantQuery.isError && (
            <>
              <TenantTable
                tenants={tenants}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <div className="tenant-pagination">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: currentPage - 1,
                    }))
                  }
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: currentPage + 1,
                    }))
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default TenantsPage;
