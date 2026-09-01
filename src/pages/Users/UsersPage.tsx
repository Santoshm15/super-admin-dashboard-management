import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import UserFilters from "../../components/users/UserFilters";
import UserTable from "../../components/users/UserTable";
import UserForm from "../../components/users/UserForm";

import useDebounce from "../../hooks/useDebounce";

import { createUser, updateUser, deleteUser } from "../../api/users.api";

import { usersQuery, userDetailsQuery } from "../../queries/userQueries";

import { queryKeys } from "../../queries/queryKeys";

import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListParams,
  UserStatus,
  UsersResponse,
} from "../../types/user.types";

function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<UserListParams>({
    search: "",
    page: 1,
    limit: 10,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const debouncedSearch = useDebounce(filters.search ?? "", 500);

  const queryParams: UserListParams = {
    ...filters,
    search: debouncedSearch,
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
  };

  const usersQueryResult = useQuery(usersQuery(queryParams));

  const createUserMutation = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists,
      });

      setShowCreateForm(false);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(input),

    onSuccess: (updatedUser) => {
      queryClient.setQueryData<User>(
        queryKeys.users.detail(updatedUser.id),
        updatedUser,
      );

      queryClient.setQueriesData<UsersResponse>(
        {
          queryKey: queryKeys.users.lists,
        },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === updatedUser.id ? updatedUser : user,
            ),
          };
        },
      );

      setEditingUserId(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),

    onSuccess: async (_, userId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(userId),
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists,
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: number;
      status: UserStatus;
    }) => {
      const currentUser = queryClient.getQueryData<User>(
        queryKeys.users.detail(userId),
      );

      if (!currentUser) {
        throw new Error("User details are not available.");
      }

      return updateUser({
        id: userId,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        tenantId: currentUser.tenantId,
        status,
      });
    },

    onMutate: async ({ userId, status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.lists,
      });

      await queryClient.cancelQueries({
        queryKey: queryKeys.users.detail(userId),
      });

      const previousUserLists = queryClient.getQueriesData<UsersResponse>({
        queryKey: queryKeys.users.lists,
      });

      const previousUser = queryClient.getQueryData<User>(
        queryKeys.users.detail(userId),
      );

      queryClient.setQueriesData<UsersResponse>(
        {
          queryKey: queryKeys.users.lists,
        },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            users: oldData.users.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    status,
                  }
                : user,
            ),
          };
        },
      );

      if (previousUser) {
        queryClient.setQueryData<User>(queryKeys.users.detail(userId), {
          ...previousUser,
          status,
        });
      }

      return {
        previousUserLists,
        previousUser,
      };
    },

    onError: (_error, variables, context) => {
      if (!context) {
        return;
      }

      context.previousUserLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      if (context.previousUser) {
        queryClient.setQueryData<User>(
          queryKeys.users.detail(variables.userId),
          context.previousUser,
        );
      }
    },

    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
    },
  });

  const handleCreateUser = (data: CreateUserInput) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data: CreateUserInput) => {
    if (editingUserId === null) {
      return;
    }

    updateUserMutation.mutate({
      id: editingUserId,
      ...data,
    });
  };

  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handlePrefetchUser = (userId: number) => {
    void queryClient.prefetchQuery(userDetailsQuery(userId));
  };

  const handleEditUser = (userId: number) => {
    setShowCreateForm(false);
    setEditingUserId(userId);
  };

  const handleDeleteUser = (userId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) {
      return;
    }

    deleteUserMutation.mutate(userId);
  };

  const handleStatusChange = (userId: number, status: UserStatus) => {
    statusMutation.mutate({
      userId,
      status,
    });
  };

  const handleToggleCompare = (userId: number) => {
    setSelectedUserIds((currentIds) => {
      if (currentIds.includes(userId)) {
        return currentIds.filter((id) => id !== userId);
      }

      return [...currentIds, userId];
    });
  };

  const comparisonQueries = useQueries({
    queries: selectedUserIds.map((userId) => userDetailsQuery(userId)),
  });

  const comparisonUsers = comparisonQueries
    .map((query) => query.data)
    .filter((user): user is User => user !== undefined);

  const handlePreviousPage = () => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: Math.max(1, (currentFilters.page ?? 1) - 1),
    }));
  };

  const handleNextPage = () => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: (currentFilters.page ?? 1) + 1,
    }));
  };

  const currentPage = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const totalUsers = usersQueryResult.data?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

  const editingUser = usersQueryResult.data?.users.find(
    (user) => user.id === editingUserId,
  );

  const currentUsers = usersQueryResult.data?.users ?? [];

  return (
    <main className="users-page">
      <header className="users-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage users, roles, tenants, and status.</p>
        </div>

        <button
          type="button"
          className="create-user-button"
          onClick={() => {
            setEditingUserId(null);
            setShowCreateForm(true);
          }}
          disabled={deleteUserMutation.isPending || statusMutation.isPending}
        >
          + Create User
        </button>
      </header>

      {(showCreateForm || editingUser) && (
        <section className="users-form-section">
          <UserForm
            user={editingUser}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingUserId(null);
            }}
            isSubmitting={
              editingUser
                ? updateUserMutation.isPending
                : createUserMutation.isPending
            }
          />

          {editingUser && updateUserMutation.isError && (
            <div className="users-mutation-error">
              Failed to update user. Please try again.
            </div>
          )}

          {!editingUser && createUserMutation.isError && (
            <div className="users-mutation-error">
              Failed to create user. Please try again.
            </div>
          )}
        </section>
      )}

      {deleteUserMutation.isError && (
        <div className="users-mutation-error">
          Failed to delete user. Please try again.
        </div>
      )}

      {deleteUserMutation.isPending && (
        <div className="users-updating">Deleting user...</div>
      )}

      {statusMutation.isError && (
        <div className="users-mutation-error">
          Failed to update user status. The previous status has been restored.
        </div>
      )}

      {statusMutation.isPending && (
        <div className="users-updating">Saving status...</div>
      )}

      <UserFilters filters={filters} onChange={setFilters} />

      {usersQueryResult.isLoading && (
        <div className="users-loading">Loading users...</div>
      )}

      {usersQueryResult.isError && (
        <div className="users-error">
          <h2>Unable to load users</h2>

          <p>Something went wrong while loading users.</p>

          <button
            type="button"
            onClick={() => {
              void usersQueryResult.refetch();
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {usersQueryResult.data && (
        <>
          <section className="users-table-section">
            <div className="users-table-header">
              <div>
                <h2>User List</h2>
                <span>{totalUsers} users</span>
              </div>

              {usersQueryResult.isFetching && (
                <span className="users-updating">Updating...</span>
              )}
            </div>

            <UserTable
              users={usersQueryResult.data.users}
              onView={handleViewUser}
              onPrefetch={handlePrefetchUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onStatusChange={handleStatusChange}
              statusUpdatingUserId={
                statusMutation.isPending
                  ? (statusMutation.variables?.userId ?? null)
                  : null
              }
            />
          </section>

          <section className="user-comparison-section">
            <div className="user-comparison-header">
              <div>
                <h2>Compare Users</h2>

                <p>Select multiple users to compare their details.</p>
              </div>

              <span className="comparison-count">
                {selectedUserIds.length} selected
              </span>
            </div>

            <div className="user-comparison-selection">
              {currentUsers.map((user) => (
                <label key={user.id} className="user-comparison-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleToggleCompare(user.id)}
                  />

                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                </label>
              ))}
            </div>

            {selectedUserIds.length > 0 && (
              <>
                {comparisonQueries.some((query) => query.isLoading) && (
                  <div className="users-loading">
                    Loading comparison data...
                  </div>
                )}

                {comparisonQueries.some((query) => query.isError) && (
                  <div className="users-mutation-error">
                    Failed to load one or more selected users.
                  </div>
                )}

                {comparisonUsers.length > 0 && (
                  <div className="user-comparison-grid">
                    {comparisonUsers.map((user) => (
                      <article key={user.id} className="user-comparison-card">
                        <div className="comparison-card-header">
                          <img
                            src={user.image}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="user-comparison-avatar"
                          />

                          <div>
                            <h3>
                              {user.firstName} {user.lastName}
                            </h3>

                            <p>{user.email}</p>

                            <span
                              className={`comparison-status ${user.status.toLowerCase()}`}
                            >
                              {user.status}
                            </span>
                          </div>
                        </div>

                        <div className="comparison-details">
                          <div className="comparison-detail">
                            <span>Role</span>
                            <strong>{user.role}</strong>
                          </div>

                          <div className="comparison-detail">
                            <span>Tenant</span>
                            <strong>{user.tenantName}</strong>
                          </div>

                          <div className="comparison-detail">
                            <span>Phone</span>
                            <strong>{user.phone || "Not available"}</strong>
                          </div>

                          <div className="comparison-detail">
                            <span>Company</span>
                            <strong>
                              {user.company.name || "Not available"}
                            </strong>
                          </div>

                          <div className="comparison-detail">
                            <span>Department</span>
                            <strong>
                              {user.company.department || "Not available"}
                            </strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedUserIds.length === 0 && (
              <div className="user-comparison-empty">
                Select users above to compare them.
              </div>
            )}
          </section>

          <div className="users-pagination">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || usersQueryResult.isFetching}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={
                currentPage >= totalPages || usersQueryResult.isFetching
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default UsersPage;
