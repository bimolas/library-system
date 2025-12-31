"use client";

import { useState, use, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  UserCircle,
  Mail,
  Award,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Ban,
  Gift,
  AlertCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getMyReadingAnalytics,
  getUserAnalyticsData,
  getUserReadingAnalytics,
} from "@/services/user.service";
import { getMyBorrowings, getUserBorrowings } from "@/services/borrow.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [genreData, setGenreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersData = await getUserAnalyticsData(resolvedParams.id);
        const genres = await getUserReadingAnalytics(resolvedParams.id);
        const borrowings = await getUserBorrowings(resolvedParams.id);
        console.log("borrowings", borrowings);
        usersData.preferences = {
          favoriteGenres: ["Fiction", "Mystery", "Science Fiction"],
          emailNotifications: true,
          borrowReminders: true,
        };
        if (!mounted) return;
        if (usersData) setUser(usersData);
        if (genres) {
          setGenreData(
            genres.map((g: any, index: number) => ({
              ...g,
              value : g.count,
              name: g.genre,
              color: ["#8b5a2b", "#a0522d", "#cd853f", "#deb887"][index % 4],
            }))
          );
        }
        if(borrowings) setBorrowings(borrowings);
        console.log("usersData", usersData);
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

  // Mock user data - in real app would fetch based on params.id
  // const user = {
  //   id: resolvedParams.id,
  //   name: "Sarah Johnson",
  //   email: "sarah.johnson@example.com",
  //   level: "platinum",
  //   score: 12450,
  //   activeBorrows: 3,
  //   totalBorrows: 48,
  //   onTimeRate: 98,
  //   status: "active",
  //   joinDate: new Date(2023, 5, 15),
  //   customBorrowDays: 28,
  //   penalties: 2,
  //   bonuses: 8,
  //   profileImage: null,
  //   preferences: {
  //     favoriteGenres: ["Fiction", "Mystery", "Science Fiction"],
  //     emailNotifications: true,
  //     borrowReminders: true,
  //   },
  // };

  const scoreHistory = [
    { month: "Jul", score: 0 },
    { month: "Aug", score: 40 },
    { month: "Sep", score: 50 },
    { month: "Oct", score: 80 },
    { month: "Nov", score: 100 },
    { month: "Dec", score: user?.currentScore },
  ];

  const borrowHistory = [
    {
      id: "1",
      title: "The Midnight Library",
      author: "Matt Haig",
      borrowDate: new Date(2024, 10, 15),
      returnDate: new Date(2024, 11, 1),
      status: "returned",
      onTime: true,
    },
    {
      id: "2",
      title: "Project Hail Mary",
      author: "Andy Weir",
      borrowDate: new Date(2024, 10, 20),
      returnDate: null,
      status: "active",
      onTime: true,
    },
    {
      id: "3",
      title: "The Silent Patient",
      author: "Alex Michaelides",
      borrowDate: new Date(2024, 9, 10),
      returnDate: new Date(2024, 9, 28),
      status: "returned",
      onTime: true,
    },
    {
      id: "4",
      title: "Atomic Habits",
      author: "James Clear",
      borrowDate: new Date(2024, 8, 5),
      returnDate: new Date(2024, 8, 25),
      status: "returned",
      onTime: false,
    },
  ];

  const genreStats = [
    { name: "Fiction", value: 18, color: "#8b5a2b" },
    { name: "Mystery", value: 12, color: "#a0522d" },
    { name: "Sci-Fi", value: 10, color: "#cd853f" },
    { name: "Non-Fiction", value: 8, color: "#deb887" },
  ];

  const levelColors = {
    platinum: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    gold: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    silver: "bg-slate-400/10 text-slate-500 border-slate-400/30",
    bronze: "bg-orange-700/10 text-orange-700 border-orange-700/30",
  };

  return (
    <div className="min-h-screen bg-background page-container">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-6 gap-2 hover-lift">
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Button>
        </Link>

        {/* User Header */}
        <Card className="p-6 border-border mb-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">
                    {user?.name || "Loading..."}
                  </h1>
                  <Badge
                    className={
                      levelColors[user?.tier as keyof typeof levelColors]
                    }
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {user?.tier}
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {user?.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 bg-transparent hover-lift"
              >
                <Settings className="w-4 h-4" />
                Edit User
              </Button>
              <Button variant="destructive" className="gap-2 hover-lift">
                <Ban className="w-4 h-4" />
                Ban User
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4 border-border animate-slideIn">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {user?.currentScore?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Score</p>
            </div>
          </Card>
          <Card
            className="p-4 border-border animate-slideIn"
            style={{ animationDelay: "30ms" }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.borrowCount}</p>
              <p className="text-xs text-muted-foreground">Total Borrows</p>
            </div>
          </Card>
          <Card
            className="p-4 border-border animate-slideIn"
            style={{ animationDelay: "60ms" }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {user?.onTimeRate || 0}%
              </p>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
            </div>
          </Card>
          <Card
            className="p-4 border-border animate-slideIn"
            style={{ animationDelay: "90ms" }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.customBorrowDays || 14}</p>
              <p className="text-xs text-muted-foreground">Borrow Days</p>
            </div>
          </Card>
          <Card
            className="p-4 border-border animate-slideIn"
            style={{ animationDelay: "120ms" }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {user?.penalties || 0}
              </p>
              <p className="text-xs text-muted-foreground">Penalties</p>
            </div>
          </Card>
          <Card
            className="p-4 border-border animate-slideIn"
            style={{ animationDelay: "150ms" }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {user?.bonuses || 0}
              </p>
              <p className="text-xs text-muted-foreground">Bonuses</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fadeIn"
        >
          <TabsList className="bg-muted/50 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Borrow History</TabsTrigger>
            <TabsTrigger value="penalties">Penalties & Bonuses</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Progression */}
              <Card className="p-6 border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Score Progression
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreHistory}>
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5a2b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5a2b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="month" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5a2b"
                        strokeWidth={2}
                        fill="url(#scoreGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Genre Distribution */}
              <Card className="p-6 border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Reading by Genre
                </h3>
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {genreData.map((genre, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: genre.color }}
                      />
                      <span className="text-sm">
                        {genre.name}: {genre.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-4 px-4 font-semibold">
                        Book
                      </th>
                      <th className="text-center py-4 px-4 font-semibold">
                        Borrow Date
                      </th>
                      <th className="text-center py-4 px-4 font-semibold">
                        Return Date
                      </th>
                      <th className="text-center py-4 px-4 font-semibold">
                        Status
                      </th>
                      <th className="text-center py-4 px-4 font-semibold">
                        On Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowings.map((borrow, index) => (
                      <tr
                        key={borrow.id}
                        className="border-b border-border hover:bg-muted/30 transition-smooth animate-fadeIn"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold">{borrow?.book?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {borrow?.book?.author}
                            </p>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          {borrow?.borrowDate ? new Date(borrow.borrowDate).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                          ) : "-"}
                        </td>
                        <td className="text-center py-4 px-4">
                          {borrow?.dueDate ? new Date(borrow.dueDate).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                          ) : "-"}
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge
                            className={
                              borrow.status === "ACTIVE"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {borrow?.status}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4">
                          {borrow.status === "COMPLETED" &&
                            (!borrow.onTime ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600 mx-auto" />
                            ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="penalties" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  Penalties ({user?.penalties || 0})
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">Late Return</p>
                      <span className="text-xs text-muted-foreground">
                        Oct 15, 2024
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Atomic Habits - 3 days late
                    </p>
                    <p className="text-xs text-red-600 mt-1">-50 points</p>
                  </div>
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">Missed Reservation</p>
                      <span className="text-xs text-muted-foreground">
                        Aug 20, 2024
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Did not pick up reserved book
                    </p>
                    <p className="text-xs text-red-600 mt-1">-30 points</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-600">
                  <Gift className="w-4 h-4" />
                  Bonuses ({user?.bonuses || 0})
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">Reading Streak</p>
                      <span className="text-xs text-muted-foreground">
                        Dec 1, 2024
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      30 day reading streak
                    </p>
                    <p className="text-xs text-amber-600 mt-1">+100 points</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">Genre Explorer</p>
                      <span className="text-xs text-muted-foreground">
                        Nov 15, 2024
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Read 5+ genres
                    </p>
                    <p className="text-xs text-amber-600 mt-1">+75 points</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">Early Return</p>
                      <span className="text-xs text-muted-foreground">
                        Nov 1, 2024
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Returned 5+ days early
                    </p>
                    <p className="text-xs text-amber-600 mt-1">+25 points</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-6">User Preferences</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Favorite Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user?.preferences?.favoriteGenres.map(
                      (genre: any, index: any) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-primary/5"
                        >
                          {genre}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Email Notifications</span>
                    <Badge
                      className={
                        user?.preferences?.emailNotifications
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted"
                      }
                    >
                      {user?.preferences?.emailNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Borrow Reminders</span>
                    <Badge
                      className={
                        user?.preferences?.borrowReminders
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted"
                      }
                    >
                      {user?.preferences?.borrowReminders
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
