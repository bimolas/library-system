import { User } from "@/lib/types"

// ...existing code...
const ACCESS_KEY = "library_access_token"
const REFRESH_KEY = "library_refresh_token"
const USER_KEY = "library_user"

type LoginResponse = {
  accessToken: string
  refreshToken: string
  user?: any
}
const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000/api"

export async function login(email: string, password: string, role: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL || ""}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || "Login failed")
  }

  const data = (await res.json()) as LoginResponse

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error("Invalid tokens returned from server")
  }

  setTokens(data.accessToken, data.refreshToken)
  if (data.user) {
    setUser(data.user)
  }
  return data
}

export async function signup(
  name: string,
  email: string,
  password: string,
  studentId: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, studentId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || "Signup failed")
  }

  const data = (await res.json()) as LoginResponse

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error("Invalid tokens returned from server")
  }

  setTokens(data.accessToken, data.refreshToken)
  if (data.user) {
    setUser(data.user)
  }
  return data
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): any | null {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
      window.location.href = "/login";

  // Optionally call backend logout endpoint
}

export async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error("No refresh token")

  const res = await fetch(`${BASE_URL || ""}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    logout()
    throw new Error("Unable to refresh token")
  }

  const data = await res.json()
  if (!data?.accessToken || !data?.refreshToken) {
    logout()
    throw new Error("Invalid tokens from refresh")
  }
  setTokens(data.accessToken, data.refreshToken)
}

export async function updateProfile(id:string, updatedData: Partial<User>, imageFile?: File): Promise<User> {
  const token = localStorage.getItem(ACCESS_KEY) || ""

  let res: Response
  if (imageFile) {
    const form = new FormData()
    // append fields
    Object.entries(updatedData || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value))
      }
    })
    // append image file under "profileImage" (backend should expect this field)
    form.append("file", imageFile)
    res = await fetch(`${BASE_URL || ""}/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      } as any, // allowing FormData request to omit Content-Type
      body: form,
    })
  } else {
    res = await fetch(`${BASE_URL || ""}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || "Profile update failed")
  }

  const data = (await res.json()) as User
  // Update stored user
  setUser(data)
  return data
 }