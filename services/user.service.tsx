import { apiGetJson } from "./api-client";
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

