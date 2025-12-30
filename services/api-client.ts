import {
  getAccessToken,
  getRefreshToken,
  logout,
  setTokens,
} from "./auth.service";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// function getAccessToken(): string | null {
//   try {
//     return localStorage.getItem("accessToken")
//   } catch {
//     return null
//   }
// }

// function setAccessToken(token: string | null) {
//   try {
//     if (token) localStorage.setItem("accessToken", token)
//     else localStorage.removeItem("accessToken")
//   } catch {}
// }

// function getRefreshToken(): string | null {
//   try {
//     return localStorage.getItem("refreshToken")
//   } catch {
//     return null
//   }
// }

// function clearAuthAndRedirect() {
//   try {
//     localStorage.removeItem("accessToken")
//     localStorage.removeItem("refreshToken")
//     // optional: other keys
//   } catch {}
//   if (typeof window !== "undefined") {
//     window.location.href = "/login"
//   }
// }

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    const url = `${API_BASE.replace(/\/$/, "")}/auth/refresh`;
    const opts: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // if you keep refresh token in an httpOnly cookie, include credentials
      credentials: "include",
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    };
    const res = await fetch(url, opts);
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (!data) return false;
    if (data.accessToken)
      setTokens(data.accessToken, data.refreshToken || refreshToken);
    if (data.refreshToken) {
      try {
        localStorage.setItem("refreshToken", data.refreshToken);
      } catch {}
    }
    return true;
  } catch (e) {
    console.error("refreshAccessToken error", e);
    return false;
  }
}


export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const url =
    typeof input === "string" && input.startsWith("/") && API_BASE
      ? `${API_BASE.replace(/\/$/, "")}${input}`
      : input;
  // clone headers
  const headers = new Headers(init.headers ?? {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers, credentials: "include" });
  if (res.status !== 401) return res;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    logout();
    throw new Error("Unauthorized");
  }

  const newToken = getAccessToken();
  if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
  const retry = await fetch(url, { ...init, headers, credentials: "include" });
  if (retry.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }
  return retry;
}


export async function apiGetJson<T = any>(path: string, isPublic: boolean = false): Promise<any> {
    let header = {};
    if (!isPublic) {
        const token = getAccessToken();
        if (!token) throw new Error("No access token");
        header = { Authorization: `Bearer ${token}` };
    }
  const res = await fetch(path, { method: "GET", headers: { ...header } });
 
  return res;
}

export async function apiPostJson<T = any>(
  path: string,
  body: any,
  isPublic: boolean = false
): Promise<any> {
  let header = {};
  if (!isPublic) {
    const token = getAccessToken();
    if (!token) throw new Error("No access token");
    header = { Authorization: `Bearer ${token}` };
  }
  console.log("apiPostJson body:", body);
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...header },
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiPutJson<T = any>(path: string, body: any, isPublic: boolean = false): Promise<any> {
     let header = {};
  if (!isPublic) {
    const token = getAccessToken();
    if (!token) throw new Error("No access token");
    header = { Authorization: `Bearer ${token}` };
  }
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...header },
    body: JSON.stringify(body),
  });
  
  return res;
}

export async function apiDeleteJson<T = any>(path: string, isPublic: boolean = false): Promise<any> {
     let header = {};
  if (!isPublic) {
    const token = getAccessToken();
    if (!token) throw new Error("No access token");
    header = { Authorization: `Bearer ${token}` };
  }
  const res = await fetch(path, { method: "DELETE", headers: { ...header } });

  return res;
}
