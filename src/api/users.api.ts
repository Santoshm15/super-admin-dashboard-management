import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserActivity,
  UserListParams,
  UsersResponse,
  UserRole,
  UserStatus,
} from "../types/user.types";

const API_URL = "https://dummyjson.com";

const STORAGE_KEY = "super_admin_user_meta";
const CREATED_USERS_STORAGE_KEY = "super_admin_created_users";

interface StoredUserMeta {
  role: UserRole;
  status: UserStatus;
  tenantId: number;
  tenantName: string;
}

type StoredUserMetaMap = Record<string, StoredUserMeta>;

interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username?: string;
  image?: string;

  company?: {
    name?: string;
    title?: string;
    department?: string;
  };

  address?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

/* =========================================================
   LOCAL STORAGE - USER META
========================================================= */

const getStoredUserMeta = (): StoredUserMetaMap => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {};
    }

    return JSON.parse(stored) as StoredUserMetaMap;
  } catch {
    return {};
  }
};

const saveStoredUserMeta = (meta: StoredUserMetaMap): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
};

/* =========================================================
   LOCAL STORAGE - CREATED USERS
========================================================= */

const getCreatedUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(CREATED_USERS_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as User[];
  } catch {
    return [];
  }
};

const saveCreatedUsers = (users: User[]): void => {
  localStorage.setItem(CREATED_USERS_STORAGE_KEY, JSON.stringify(users));
};

/* =========================================================
   DEFAULT ROLE / STATUS
========================================================= */

const getDefaultMeta = (
  userId: number,
  companyName: string,
): StoredUserMeta => {
  const roles: UserRole[] = ["User", "Admin", "Manager", "Viewer"];

  const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];

  return {
    role: roles[(userId - 1) % roles.length],
    status: statuses[(userId - 1) % statuses.length],
    tenantId: userId,
    tenantName: companyName || "Default Tenant",
  };
};

/* =========================================================
   MAP API USER
========================================================= */

const mapUser = (user: DummyJsonUser, storedMeta: StoredUserMetaMap): User => {
  const companyName = user.company?.name ?? "";

  const defaultMeta = getDefaultMeta(user.id, companyName);

  const meta = storedMeta[String(user.id)] ?? defaultMeta;

  return {
    id: user.id,

    firstName: user.firstName,
    lastName: user.lastName,

    email: user.email,

    phone: user.phone ?? "",
    username: user.username ?? "",
    image: user.image ?? "",

    role: meta.role,
    status: meta.status,

    tenantId: meta.tenantId,
    tenantName: meta.tenantName,

    company: {
      name: companyName,
      title: user.company?.title ?? "",
      department: user.company?.department ?? "",
    },

    address: {
      address: user.address?.address ?? "",
      city: user.address?.city ?? "",
      state: user.address?.state ?? "",
      postalCode: user.address?.postalCode ?? "",
      country: user.address?.country ?? "",
    },
  };
};

/* =========================================================
   GET USERS
========================================================= */

export const getUsers = async ({
  search = "",
  role,
  status,
  tenantId,
  page = 1,
  limit = 10,
  signal,
}: UserListParams & {
  signal?: AbortSignal;
}): Promise<UsersResponse> => {
  const searchValue = search.trim();

  let url = `${API_URL}/users`;

  if (searchValue) {
    url = `${API_URL}/users/search?q=${encodeURIComponent(searchValue)}`;
  }

  url = `${url}${url.includes("?") ? "&" : "?"}limit=0`;

  const response = await fetch(url, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data: {
    users?: DummyJsonUser[];
  } = await response.json();

  const storedMeta = getStoredUserMeta();

  let users: User[] = (data.users ?? []).map((user) =>
    mapUser(user, storedMeta),
  );

  /*
   * IMPORTANT:
   * Add locally-created users because DummyJSON does not
   * permanently save users created through /users/add.
   */
  const createdUsers = getCreatedUsers();

  const existingIds = new Set(users.map((user) => user.id));

  for (const createdUser of createdUsers) {
    if (!existingIds.has(createdUser.id)) {
      users.push(createdUser);
    }
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  if (searchValue) {
    const searchLower = searchValue.toLowerCase();

    users = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.tenantName.toLowerCase().includes(searchLower)
      );
    });
  }

  /* =========================================================
     ROLE FILTER
  ========================================================= */

  if (role) {
    users = users.filter((user) => user.role === role);
  }

  /* =========================================================
     STATUS FILTER
  ========================================================= */

  if (status) {
    users = users.filter((user) => user.status === status);
  }

  /* =========================================================
     TENANT FILTER
  ========================================================= */

  if (tenantId !== undefined && tenantId !== null) {
    users = users.filter((user) => user.tenantId === tenantId);
  }

  /* =========================================================
     PAGINATION
  ========================================================= */

  const total = users.length;

  const skip = (page - 1) * limit;

  const paginatedUsers = users.slice(skip, skip + limit);

  return {
    users: paginatedUsers,
    total,
    skip,
    limit,
  };
};

/* =========================================================
   GET USER BY ID
========================================================= */

export const getUserById = async (
  userId: number,
  signal?: AbortSignal,
): Promise<User> => {
  const createdUsers = getCreatedUsers();

  const locallyCreatedUser = createdUsers.find((user) => user.id === userId);

  if (locallyCreatedUser) {
    return locallyCreatedUser;
  }

  const response = await fetch(`${API_URL}/users/${userId}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  const user: DummyJsonUser = await response.json();

  const storedMeta = getStoredUserMeta();

  return mapUser(user, storedMeta);
};

/* =========================================================
   GET USER ACTIVITY
========================================================= */

export const getUserActivity = async (
  userId: number,
  signal?: AbortSignal,
): Promise<UserActivity[]> => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user activity");
  }

  const user: DummyJsonUser = await response.json();

  return [
    {
      id: user.id,
      userId: user.id,
      action: "User viewed",
      description: `${user.firstName} ${user.lastName} profile was viewed`,
      timestamp: new Date().toISOString(),
    },
  ];
};

/* =========================================================
   CREATE USER
========================================================= */

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const response = await fetch(`${API_URL}/users/add`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  const user: DummyJsonUser = await response.json();

  const createdUser: User = {
    id: user.id,

    firstName: input.firstName,
    lastName: input.lastName,

    email: input.email,

    phone: user.phone ?? "",
    username: user.username ?? "",
    image: user.image ?? "",

    role: input.role,
    status: input.status,

    tenantId: input.tenantId,
    tenantName: "Default Tenant",

    company: {
      name: user.company?.name ?? "",
      title: user.company?.title ?? "",
      department: user.company?.department ?? "",
    },

    address: {
      address: user.address?.address ?? "",
      city: user.address?.city ?? "",
      state: user.address?.state ?? "",
      postalCode: user.address?.postalCode ?? "",
      country: user.address?.country ?? "",
    },
  };

  /* Save role/status/tenant metadata */

  const storedMeta = getStoredUserMeta();

  storedMeta[String(createdUser.id)] = {
    role: createdUser.role,
    status: createdUser.status,
    tenantId: createdUser.tenantId,
    tenantName: createdUser.tenantName,
  };

  saveStoredUserMeta(storedMeta);

  /* Save the complete created user */

  const createdUsers = getCreatedUsers();

  const updatedCreatedUsers = [
    ...createdUsers.filter(
      (existingUser) => existingUser.id !== createdUser.id,
    ),
    createdUser,
  ];

  saveCreatedUsers(updatedCreatedUsers);

  return createdUser;
};

/* =========================================================
   UPDATE USER
========================================================= */

export const updateUser = async (input: UpdateUserInput): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${input.id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const user: DummyJsonUser = await response.json();

  const storedMeta = getStoredUserMeta();

  const existingMeta =
    storedMeta[String(input.id)] ??
    getDefaultMeta(input.id, user.company?.name ?? "");

  const updatedUser: User = {
    id: input.id,

    firstName: input.firstName,
    lastName: input.lastName,

    email: input.email,

    phone: user.phone ?? "",
    username: user.username ?? "",
    image: user.image ?? "",

    role: input.role,
    status: input.status,

    tenantId: input.tenantId,
    tenantName: existingMeta.tenantName,

    company: {
      name: user.company?.name ?? "",
      title: user.company?.title ?? "",
      department: user.company?.department ?? "",
    },

    address: {
      address: user.address?.address ?? "",
      city: user.address?.city ?? "",
      state: user.address?.state ?? "",
      postalCode: user.address?.postalCode ?? "",
      country: user.address?.country ?? "",
    },
  };

  /* Save metadata */

  storedMeta[String(input.id)] = {
    role: updatedUser.role,
    status: updatedUser.status,
    tenantId: updatedUser.tenantId,
    tenantName: updatedUser.tenantName,
  };

  saveStoredUserMeta(storedMeta);

  /* Update locally-created user if it exists */

  const createdUsers = getCreatedUsers();

  const createdUserExists = createdUsers.some(
    (user) => user.id === updatedUser.id,
  );

  if (createdUserExists) {
    const updatedCreatedUsers = createdUsers.map((user) =>
      user.id === updatedUser.id ? updatedUser : user,
    );

    saveCreatedUsers(updatedCreatedUsers);
  }

  return updatedUser;
};

/* =========================================================
   DELETE USER
========================================================= */

export const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  /* Delete metadata */

  const storedMeta = getStoredUserMeta();

  delete storedMeta[String(userId)];

  saveStoredUserMeta(storedMeta);

  /* Delete locally-created user */

  const createdUsers = getCreatedUsers();

  const remainingUsers = createdUsers.filter((user) => user.id !== userId);

  saveCreatedUsers(remainingUsers);
};
