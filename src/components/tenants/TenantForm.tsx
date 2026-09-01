import { useState } from "react";

import type {
  CreateTenantInput,
  Tenant,
  TenantPlan,
  TenantStatus,
} from "../../types/tenant.types";

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (data: CreateTenantInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  name?: string;
}

const plans: TenantPlan[] = ["Free", "Basic", "Pro", "Enterprise"];

const statuses: TenantStatus[] = ["Active", "Inactive", "Suspended"];

function TenantForm({
  tenant,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TenantFormProps) {
  const [name, setName] = useState(tenant?.name ?? "");
  const [plan, setPlan] = useState<TenantPlan>(tenant?.plan ?? "Basic");
  const [status, setStatus] = useState<TenantStatus>(
    tenant?.status ?? "Active",
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Tenant name is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      plan,
      status,
    });
  };

  return (
    <form className="tenant-form" onSubmit={handleSubmit} noValidate>
      <div className="tenant-form-header">
        <div>
          <h2>{tenant ? "Edit Tenant" : "Create Tenant"}</h2>

          <p>
            {tenant
              ? "Update the tenant information."
              : "Add a new tenant to the system."}
          </p>
        </div>
      </div>

      <div className="tenant-form-grid">
        <div className="tenant-form-field tenant-form-field-full">
          <label htmlFor="tenant-name">Tenant Name</label>

          <input
            id="tenant-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);

              if (errors.name) {
                setErrors({});
              }
            }}
            placeholder="Enter tenant name"
            disabled={isSubmitting}
          />

          {errors.name && (
            <span className="tenant-form-error">{errors.name}</span>
          )}
        </div>

        <div className="tenant-form-field">
          <label htmlFor="tenant-plan">Plan</label>

          <select
            id="tenant-plan"
            value={plan}
            onChange={(event) => setPlan(event.target.value as TenantPlan)}
            disabled={isSubmitting}
          >
            {plans.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="tenant-form-field">
          <label htmlFor="tenant-status">Status</label>

          <select
            id="tenant-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as TenantStatus)}
            disabled={isSubmitting}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tenant-form-actions">
        <button
          type="button"
          className="tenant-form-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="tenant-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : tenant
              ? "Update Tenant"
              : "Create Tenant"}
        </button>
      </div>
    </form>
  );
}

export default TenantForm;
