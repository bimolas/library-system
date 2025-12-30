"use client";

import { Navigation } from "@/components/navigation";
import { ScoreCard } from "@/components/dashboard/score-card";
import { ActiveBorrows } from "@/components/dashboard/active-borrows";
import { ActiveReservations } from "@/components/dashboard/active-reservations";
import { RecommendedBooks } from "@/components/dashboard/recommended-books";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { mockCurrentUser } from "@/lib/mock-data";
import { getUser } from "@/services/auth.service";
import { useEffect, useState } from "react";
import { getMyanalyticsData } from "@/services/user.service";
import { apiGetJson } from "@/services/api-client";

export default function DashboardPage() {
  // const localUser = getUser()?.name || "Guest";
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const getUserData = getUser();
        if (!getUserData) throw new Error("User not logged in");
        setUser(getUserData);
        // get full profile
        const profile = await getMyanalyticsData();
        
        // get optional score summary (if separate endpoint)
        const scoreSummary = await apiGetJson("/users/me/score").catch(
          () => null
        );

        if (!mounted) return;
        if (profile) setUser((prev: any) => ({ ...(prev ?? {}), ...profile }));
        if (scoreSummary)
          setUser((prev: any) => ({
            ...(prev ?? {}),
            ...(scoreSummary ?? {}),
          }));
      } catch (e: any) {
        console.error("Failed to load dashboard data:", e);
        if (mounted) setError(e?.message || "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name ?? "Guest"}!
          </h1>
          <p className="text-muted-foreground">
            Here's your library overview for today
          </p>
          {loading && (
            <p className="text-sm text-muted-foreground mt-2">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-destructive mt-2">Error: {error}</p>
          )}
        </div>

        {/* Key Stats & Score */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <ScoreCard user={user ?? mockCurrentUser} />
          <QuickStats user={user } />
        </div>

        {/* Active Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <ActiveBorrows />
          <ActiveReservations />
        </div>

        {/* Recommendations */}
        <div>
          <RecommendedBooks />
        </div>
      </main>
    </div>
  );
}
