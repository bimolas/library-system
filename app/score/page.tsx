"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, CheckCircle2 } from "lucide-react";
import { mockCurrentUser } from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { getMyanalyticsData, getMyReadingAnalytics } from "@/services/user.service";

export default function ScorePage() {
  // local UI state
  const [user, setUser] = useState<any>({});
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);
  const [genreData, setGenreData] = useState<any[]>([]);
  const [scoreActivities, setScoreActivities] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tierThresholds: Record<string, number> = {
    Bronze: 0,
    Silver: 500,
    Gold: 1000,
    Platinum: 2000,
  };
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"];

  const apiFetch = async (path: string, opts: RequestInit = {}) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrl = base ? base.replace(/\/$/, "") : "";
    const url = baseUrl
      ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
      : `/api${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...opts,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Request failed: ${res.status}`);
    }
    return res.json();
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // try to get current user score/summary
        const userData = await getMyanalyticsData();
        if (mounted && userData) setUser(userData);

        // score history (chart)
        const history = await apiFetch("/users/me/score/history").catch(() =>
          // fallback: try older path or return sample
          apiFetch("/score/history").catch(() => null)
        );
        if (mounted && Array.isArray(history)) setScoreHistory(history);

        // genre breakdown
        const genres = await getMyReadingAnalytics();
        if (mounted && Array.isArray(genres)){ 
          
          setGenreData(genres.map((g: any, index: number) => ({
            ...g,
            color: g.color || `hsl(${(index * 137.5) % 360}, 65%, 55%)`,
          })));
        };

        // activities
        // const activities = await apiFetch("/users/me/score/activities").catch(
        //   () => apiFetch("/score/activities").catch(() => null)
        // );
        // if (mounted && Array.isArray(activities))
        //   setScoreActivities(activities);

        // benefits (fallback to static if backend doesn't provide)
        const backendBenefits = await apiFetch("/score/benefits").catch(
          () => null
        );
        if (mounted && Array.isArray(backendBenefits)) {
          setBenefits(backendBenefits);
        } else {
          setBenefits([
            {
              level: "Bronze",
              borrowLimit: 5,
              borrowDuration: 14,
              reservationAdvance: 2,
              priority: "Standard",
            },
            {
              level: "Silver",
              borrowLimit: 7,
              borrowDuration: 21,
              reservationAdvance: 1,
              priority: "High",
            },
            {
              level: "Gold",
              borrowLimit: 10,
              borrowDuration: 28,
              reservationAdvance: 0,
              priority: "Very High",
            },
            {
              level: "Platinum",
              borrowLimit: 15,
              borrowDuration: 35,
              reservationAdvance: -2,
              priority: "Exclusive",
            },
          ]);
        }
      } catch (e: any) {
        console.error("Failed to load score page data:", e);
        if (mounted) setError(e?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // derived values / fallbacks
  const currentUser = user || mockCurrentUser;
  const scoreData = scoreHistory.length
    ? scoreHistory
    : [
        { date: "Jan", score: 50 },
        { date: "Feb", score: 55 },
        { date: "Mar", score: 60 },
        { date: "Apr", score: 80 },
        { date: "May", score: 120 },
        { date: "Jun", score: currentUser.currentScore  },
      ];

  const genreFallback = genreData.length
    ? genreData :[]
    
  const activitiesFallback = scoreActivities.length
    ? scoreActivities
    : [
        { activity: "On-time book return", points: "+10" },
        { activity: "Reading diversity (new genre)", points: "+10" },
        { activity: "Reading streak (7+ days)", points: "+5" },
        { activity: "Late return penalty", points: "-5" },
        { activity: "Reservation cancellation", points: "-5" },
        { activity: "No-show on reservation", points: "-10" },
      ];

  // const progressToNext = ((currentUser.currentScore - 8000) / (10000 - 8000)) * 100;
  // const pointsToNext = 10000 - currentUser.currentScore;
  const currentTierIndex = Math.max(0, tiers.indexOf(currentUser.tier));
  const currentTierMin =
    tierThresholds[currentUser.tier] ??
    tierThresholds[tiers[currentTierIndex]] ??
    0;
  const nextTierName = tiers[currentTierIndex + 1];
  const nextTierMin =
    nextTierName && tierThresholds[nextTierName] !== undefined
      ? tierThresholds[nextTierName]
      : currentTierMin + 1;

  let progressToNext = 100;
  if (nextTierMin > currentTierMin) {
    progressToNext =
      ((currentUser.currentScore - currentTierMin) /
        (nextTierMin - currentTierMin)) *
      100;
    progressToNext =
      Math.round(Math.max(0, Math.min(100, progressToNext)) * 10) / 10; 
  }
  const pointsToNext = Math.max(
    0,
    Math.ceil(nextTierMin - currentUser.currentScore)
  );
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Score & Level</h1>
          <p className="text-muted-foreground">
            Track your reading reputation and unlock benefits
          </p>
          {loading && (
            <p className="text-sm text-muted-foreground mt-2">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-destructive mt-2">Error: {error}</p>
          )}
        </div>

        <Card className="p-8 mb-8 border-border bg-gradient-to-br from-primary/10 to-accent/10 animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Total Score
              </p>
              <p className="text-6xl font-bold mb-4">
                {currentUser.currentScore}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Progress to Platinum
                    </span>
                    <span className="text-sm font-semibold">
                      {isFinite(progressToNext) ? progressToNext.toFixed(1) : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.max(progressToNext, 0), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {pointsToNext.toLocaleString()} points to next level
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      Current Level
                    </p>
                    <p className="text-lg font-bold text-primary mt-1 uppercase">
                      {currentUser.tier}
                    </p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).getFullYear()
                        : "2026"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={scoreData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Score",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Level Benefits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Level</th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Borrow Limit
                  </th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Duration
                  </th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Reservation Priority
                  </th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Early Access
                  </th>
                </tr>
              </thead>
              <tbody>
                {benefits.map((benefit) => (
                  <tr
                    key={benefit.level}
                    className={`border-b border-border transition-colors ${
                      String(benefit.level).toLowerCase() ===
                      String(currentUser.tier).toLowerCase()
                        ? "bg-primary/5"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold">
                      {benefit.level}
                      {String(benefit.level).toLowerCase() ===
                        String(currentUser.tier).toLowerCase() && (
                        <Badge className="ml-2">Current</Badge>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {benefit.borrowLimit}
                    </td>
                    <td className="text-center py-3 px-4">
                      {benefit.borrowDuration} days
                    </td>
                    <td className="text-center py-3 px-4">
                      {benefit.priority}
                    </td>
                    <td className="text-center py-3 px-4">
                      {benefit.reservationAdvance > 0
                        ? `+${benefit.reservationAdvance} days`
                        : benefit.reservationAdvance < 0
                        ? `${benefit.reservationAdvance} days early`
                        : "Standard"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border-border animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">Score Activities</h3>
            <div className="space-y-3">
              {activitiesFallback.map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">
                    {activity.activity}
                  </span>
                  <Badge
                    className={
                      activity.points && String(activity.points).startsWith("-")
                        ? "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-success/10 text-success border-success/30"
                    }
                  >
                    {activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="p-6 border-border animate-fadeIn"
            style={{ animationDelay: "100ms" }}
          >
            <h3 className="text-lg font-semibold mb-4">Reading by Genre</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genreFallback}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} points`, "Score"]}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {(genreFallback || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color ?? "#8884d8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold mb-4">
            How to Increase Your Score
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/5 rounded-lg border border-success/30 hover:bg-success/10 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-success mb-2" />
              <p className="font-semibold text-sm mb-1">Return on time</p>
              <p className="text-xs text-muted-foreground">
                Every on-time return increases your score and reputation
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold text-sm mb-1">Explore new genres</p>
              <p className="text-xs text-muted-foreground">
                Reading diverse genres boosts your score significantly
              </p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/30 hover:bg-accent/10 transition-colors">
              <TrendingUp className="w-6 h-6 text-accent mb-2" />
              <p className="font-semibold text-sm mb-1">
                Build reading streaks
              </p>
              <p className="text-xs text-muted-foreground">
                Consistent borrowing activity rewards you with bonus points
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
