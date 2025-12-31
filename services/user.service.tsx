import { UserRoundIcon } from "lucide-react";
import { apiDeleteJson, apiGetJson, apiPostJson } from "./api-client";
import { getUser } from "./auth.service";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export async function getMyanalyticsData() {
  const res = await apiGetJson(`${BASE_URL || ""}/analytics/user/me`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch user analytics data");
  }

  const data = await res.json();
  return data;
}

export async function getMyReadingAnalytics() {
  const userId = getUser()?.id;
  if (!userId) {
    throw new Error("User not logged in");
  }
  const res = await apiGetJson(
    `${BASE_URL || ""}/analytics/user/${userId}/genre-distribution`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch user reading genres");
  }

  const data = await res.json();
  return data;
}

export async function getUserReadingAnalytics(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const res = await apiGetJson(
    `${BASE_URL || ""}/analytics/user/${userId}/genre-distribution`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch user reading genres");
  }

  const data = await res.json();
  return data;
}

export async function getUsers() {
  const res = await apiGetJson(`${BASE_URL || ""}/users`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch users");
  }

  const data = await res.json()
  return data.map((u: any) => ({
    ...u,
    createdAt: u.createdAt ? new Date(u.createdAt) : null,
    score: typeof u.score === "number" ? u.score : u.score.low,
    status: u?.status?.toLowerCase() || "active",
  }));
}

export async function getUserById(userId: string) {
  const res = await apiGetJson(`${BASE_URL || ""}/users/${userId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch user by ID");
  }

  const data = await res.json();
  return data;
}

export async function createUser(user: any) {
  const res = await apiPostJson(`${BASE_URL || ""}/users`, user);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to create user");
  }

  const data = await res.json();
  return data;
}


export async function deleteUser(userId: string) {
  const res = await apiDeleteJson(`${BASE_URL || ""}/users/${userId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to delete user");
  }

  return true;
}

export async function getUserAnalyticsData(userId: string) {
  const res = await apiGetJson(`${BASE_URL || ""}/analytics/user/${userId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch user analytics data");
  }

  const data = await res.json();
  return data;
}


export async function banUser(userId:string, body: any) {
  const res = await apiPostJson(`${BASE_URL || ""}/users/${userId}/ban`, body);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to create user");
  }

  const data = await res.json();
  return data;
}
