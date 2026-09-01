import { queryOptions } from "@tanstack/react-query";

import { getUsers, getUserById, getUserActivity } from "../api/users.api";

import type { UserListParams } from "../types/user.types";

import { queryKeys } from "./queryKeys";

export const usersQuery = (params: UserListParams = {}) =>
  queryOptions({
    queryKey: queryKeys.users.list(params),

    queryFn: ({ signal }) =>
      getUsers({
        ...params,
        signal,
      }),

    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

export const userDetailsQuery = (userId: number) =>
  queryOptions({
    queryKey: queryKeys.users.detail(userId),

    queryFn: ({ signal }) => getUserById(userId, signal),

    enabled: !!userId,

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

export const userActivityQuery = (userId: number) =>
  queryOptions({
    queryKey: queryKeys.users.activity(userId),

    queryFn: ({ signal }) => getUserActivity(userId, signal),

    enabled: !!userId,

    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });
