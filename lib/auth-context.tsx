"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/lib/types";
import { mockCurrentUser, mockAdminUser } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    studentId: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("library_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Demo: Check if admin login
    const loginUser = role === "ADMIN" ? mockAdminUser : mockCurrentUser;

    setUser(loginUser);
    localStorage.setItem("library_user", JSON.stringify(loginUser));

    // Redirect based on role
    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    studentId: string
  ) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create new student user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: "USER",
      score: 5000,
      level: "bronze",
      borrowingLimit: 3,
      activeBorrows: 0,
      joinedDate: new Date(),
      status: "active",
      totalBorrows: 0,
      onTimeRate: 0,
      penalties: 0,
      bonuses: 0,
    };

    setUser(newUser);
    localStorage.setItem("library_user", JSON.stringify(newUser));
    router.push("/dashboard");
    setIsLoading(false);
  };

  const logout =  async () => {
    setUser(null);
    await import("@/services/auth.service").then((mod) =>
      mod.logout()
    );
    // localStorage.removeItem("library_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
