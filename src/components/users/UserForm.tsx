import { useState } from "react";

import UserStatusToggle from "./UserStatusToggle";

import type {
  CreateUserInput,
  User,
  UserRole,
  UserStatus,
} from "../../types/user.types";

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  tenantId?: string;
}

function UserForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserFormProps) {
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "User");
  const [tenantId, setTenantId] = useState(
    user?.tenantId ? String(user.tenantId) : "",
  );
  const [status, setStatus] = useState<UserStatus>(user?.status ?? "Active");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!tenantId.trim()) {
      newErrors.tenantId = "Tenant ID is required.";
    } else if (Number.isNaN(Number(tenantId)) || Number(tenantId) <= 0) {
      newErrors.tenantId = "Enter a valid Tenant ID.";
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role,
      tenantId: Number(tenantId),
      status,
    });
  };

  return (
    <form className="user-form" onSubmit={handleSubmit} noValidate>
      <div className="user-form-header">
        <div>
          <h2>{user ? "Edit User" : "Create User"}</h2>

          <p>
            {user
              ? "Update the user information."
              : "Add a new user to the system."}
          </p>
        </div>
      </div>

      <div className="user-form-grid">
        <div className="user-form-field">
          <label htmlFor="first-name">First Name</label>

          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Enter first name"
            disabled={isSubmitting}
          />

          {errors.firstName && (
            <span className="user-form-error">{errors.firstName}</span>
          )}
        </div>

        <div className="user-form-field">
          <label htmlFor="last-name">Last Name</label>

          <input
            id="last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Enter last name"
            disabled={isSubmitting}
          />

          {errors.lastName && (
            <span className="user-form-error">{errors.lastName}</span>
          )}
        </div>

        <div className="user-form-field user-form-field-full">
          <label htmlFor="user-email">Email</label>

          <input
            id="user-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email address"
            disabled={isSubmitting}
          />

          {errors.email && (
            <span className="user-form-error">{errors.email}</span>
          )}
        </div>

        <div className="user-form-field">
          <label htmlFor="user-role">Role</label>

          <select
            id="user-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={isSubmitting}
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <div className="user-form-field">
          <label htmlFor="tenant-id">Tenant</label>

          <input
            id="tenant-id"
            type="number"
            min="1"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            placeholder="Enter tenant ID"
            disabled={isSubmitting}
          />

          {errors.tenantId && (
            <span className="user-form-error">{errors.tenantId}</span>
          )}
        </div>

        <div className="user-form-field user-form-field-full">
          <label>Status</label>

          <UserStatusToggle
            status={status}
            onChange={setStatus}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="user-form-actions">
        <button
          type="button"
          className="user-form-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="user-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}

export default UserForm;
