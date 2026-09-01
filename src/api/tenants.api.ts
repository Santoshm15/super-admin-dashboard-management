import type {
  CreateTenantInput,
  Tenant,
  TenantListParams,
  TenantsResponse,
  UpdateTenantInput,
} from "../types/tenant.types";

const API_URL = "https://dummyjson.com";

const STORAGE_KEY = "super-admin-tenants";

interface DummyUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  username?: string;
  image?: string;
  company?: {
    name?: string;
    title?: string;
    department?: string;
  };
}

interface DummyUsersResponse {
  users: DummyUser[];
  total: number;
}

interface StoredTenantData {
  created: Tenant[];
  updated: Tenant[];
  deleted: number[];
}

const getStoredTenantData = (): StoredTenantData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {
        created: [],
        updated: [],
        deleted: [],
      };
    }

    const parsed = JSON.parse(stored) as Partial<StoredTenantData>;

    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updated: Array.isArray(parsed.updated) ? parsed.updated : [],
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
    };
  } catch {
    return {
      created: [],
      updated: [],
      deleted: [],
    };
  }
};

const saveStoredTenantData = (data: StoredTenantData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const mapTenant = (id: number, name: string, userCount: number): Tenant => ({
  id,
  name,
  plan: "Pro",
  status: "Active",
  userCount,
  createdAt: new Date().toISOString(),
});

const getApiTenants = async (signal?: AbortSignal): Promise<Tenant[]> => {
  const response = await fetch(`${API_URL}/users?limit=0&skip=0`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tenants");
  }

  const data: DummyUsersResponse = await response.json();

  const tenantMap = new Map<string, number>();

  for (const user of data.users ?? []) {
    const companyName = user.company?.name?.trim();

    if (companyName) {
      tenantMap.set(companyName, (tenantMap.get(companyName) ?? 0) + 1);
    }
  }

  return Array.from(tenantMap.entries()).map(([name, userCount], index) =>
    mapTenant(index + 1, name, userCount),
  );
};

const getAllTenants = async (signal?: AbortSignal): Promise<Tenant[]> => {
  const apiTenants = await getApiTenants(signal);

  const stored = getStoredTenantData();

  const deletedIds = new Set(stored.deleted);

  let tenants = apiTenants.filter((tenant) => !deletedIds.has(tenant.id));

  tenants = tenants.map((tenant) => {
    const updatedTenant = stored.updated.find((item) => item.id === tenant.id);

    return updatedTenant ?? tenant;
  });

  const createdTenants = stored.created.filter(
    (tenant) => !deletedIds.has(tenant.id),
  );

  return [...tenants, ...createdTenants];
};

export const getTenants = async ({
  search = "",
  plan,
  status,
  page = 1,
  limit = 10,
  signal,
}: TenantListParams & {
  signal?: AbortSignal;
}): Promise<TenantsResponse> => {
  const tenants = await getAllTenants(signal);

  const searchValue = search.trim().toLowerCase();

  let filteredTenants = tenants;

  if (searchValue) {
    filteredTenants = filteredTenants.filter((tenant) =>
      tenant.name.toLowerCase().includes(searchValue),
    );
  }

  if (plan) {
    filteredTenants = filteredTenants.filter((tenant) => tenant.plan === plan);
  }

  if (status) {
    filteredTenants = filteredTenants.filter(
      (tenant) => tenant.status === status,
    );
  }

  const total = filteredTenants.length;

  const skip = (page - 1) * limit;

  const paginatedTenants = filteredTenants.slice(skip, skip + limit);

  return {
    tenants: paginatedTenants,
    total,
    skip,
    limit,
  };
};

export const getTenantById = async (
  tenantId: number,
  signal?: AbortSignal,
): Promise<Tenant> => {
  const tenants = await getAllTenants(signal);

  const tenant = tenants.find((item) => item.id === tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
};

export const getUsersByTenant = async (
  tenantId: number,
  signal?: AbortSignal,
): Promise<DummyUser[]> => {
  const tenants = await getAllTenants(signal);

  const tenant = tenants.find((item) => item.id === tenantId);

  if (!tenant) {
    return [];
  }

  const response = await fetch(`${API_URL}/users?limit=0&skip=0`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tenant users");
  }

  const data: DummyUsersResponse = await response.json();

  return (data.users ?? []).filter(
    (user) => user.company?.name?.trim() === tenant.name,
  );
};

export const createTenant = async (
  input: CreateTenantInput,
): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/users/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company: {
        name: input.name,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create tenant");
  }

  const data = await response.json();

  const existingTenants = await getApiTenants();

  const maxId = existingTenants.reduce(
    (maximum, tenant) => Math.max(maximum, tenant.id),
    0,
  );

  const stored = getStoredTenantData();

  const storedMaxId = [...stored.created, ...stored.updated].reduce(
    (maximum, tenant) => Math.max(maximum, tenant.id),
    0,
  );

  const tenant: Tenant = {
    id: Math.max(data.id ?? 0, maxId + 1, storedMaxId + 1),
    name: input.name,
    plan: input.plan,
    status: input.status,
    userCount: 0,
    createdAt: new Date().toISOString(),
  };

  stored.created.push(tenant);

  saveStoredTenantData(stored);

  return tenant;
};

export const updateTenant = async (
  input: UpdateTenantInput,
): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/users/${input.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company: {
        name: input.name,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update tenant");
  }

  const stored = getStoredTenantData();

  const existingTenant = await getTenantById(input.id);

  const updatedTenant: Tenant = {
    id: input.id,
    name: input.name,
    plan: input.plan,
    status: input.status,
    userCount: existingTenant.userCount,
    createdAt: existingTenant.createdAt,
  };

  const createdIndex = stored.created.findIndex(
    (tenant) => tenant.id === input.id,
  );

  if (createdIndex !== -1) {
    stored.created[createdIndex] = updatedTenant;
  } else {
    const updatedIndex = stored.updated.findIndex(
      (tenant) => tenant.id === input.id,
    );

    if (updatedIndex !== -1) {
      stored.updated[updatedIndex] = updatedTenant;
    } else {
      stored.updated.push(updatedTenant);
    }
  }

  saveStoredTenantData(stored);

  return updatedTenant;
};

export const deleteTenant = async (tenantId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/users/${tenantId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete tenant");
  }

  const stored = getStoredTenantData();

  stored.created = stored.created.filter((tenant) => tenant.id !== tenantId);

  stored.updated = stored.updated.filter((tenant) => tenant.id !== tenantId);

  if (!stored.deleted.includes(tenantId)) {
    stored.deleted.push(tenantId);
  }

  saveStoredTenantData(stored);
};
