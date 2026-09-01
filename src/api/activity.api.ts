import type { UserActivity } from "../types/user.types";

const API_URL = "https://dummyjson.com";

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

  const user: {
    id: number;
    firstName: string;
    lastName: string;
  } = await response.json();

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
