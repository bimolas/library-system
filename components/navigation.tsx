"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Home,
  Search,
  Award,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  BarChart3,
  Moon,
  Sun,
  BookMarked,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import type { User } from "@/lib/types";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  // const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  let theme = "light";
  let toggleTheme = () => {};
  try {
    const ctx = useTheme();
    theme = ctx.theme;
    toggleTheme = ctx.toggleTheme;
  } catch (e) {
    // If ThemeProvider is missing, don't crash; use defaults.
  }
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("library_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const studentNavItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/catalog", icon: Search, label: "Catalog" },
    { href: "/score", icon: Award, label: "Score & Level" },
    { href: "/active", icon: Clock, label: "My Activity" },
    { href: "/returns", icon: RotateCcw, label: "Returns" },
    { href: "/recommendations", icon: BookMarked, label: "Recommendations" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const adminNavItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/catalog", icon: Search, label: "Catalog" },
    { href: "/admin/books", icon: BookOpen, label: "Manage Books" },
    { href: "/admin/users", icon: Users, label: "Manage Users" },
    // { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = user?.role === "ADMIN" ? adminNavItems : studentNavItems;

  const handleLogout = async () => {
     await import("@/services/auth.service").then((mod) =>
       mod.logout()
     );
    // localStorage.removeItem("library_user");
    router.push("/login");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl w-full mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 py-4 font-bold text-lg hover-scale transition-smooth group"
          >
            <BookOpen className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LibraryHub
            </span>
            {user && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.role === "ADMIN"
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-accent/10 text-accent border border-accent/30"
                }`}
              >
                {user.role === "ADMIN" ? "Admin" : "Student"}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  className={`gap-2 ${
                    isActive(item.href) ? "hover-glow shadow-md" : "hover-lift"
                  } transition-smooth`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover-lift transition-smooth"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover-lift transition-smooth"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LibraryHub
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hover-lift transition-smooth"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="hover-scale transition-smooth"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-border animate-slideIn bg-background/95 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2 rounded-none transition-smooth hover-lift"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-none hover-lift transition-smooth"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </nav>
    </>
  );
}
