"use client";

import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { AlertCircle, TrendingUp, Users, BookOpen, Clock } from "lucide-react";
import { useLibrary } from "@/lib/library-context";
import { useEffect, useState } from "react";
import { getAnalyticsSummary, getTrendingBooks } from "@/services/book.service";

export default function AdminPage() {
  const { books, borrows, reservations } = useLibrary();
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>([
    {
      icon: BookOpen,
      label: "Active Borrows",
      value: "0",
      change: "+12 this week",
    },
    { icon: Users, label: "Total Users", value: "995", change: "+8 new" },
    {
      icon: Clock,
      label: "Avg. Borrow Duration",
      value: "0 days",
      change: "Stable",
    },
    {
      icon: TrendingUp,
      label: "Reservations",
      value: "0",
      change: "Active now",
    },
  ]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const books = await getTrendingBooks();
        const stats = await getAnalyticsSummary();

        if (!mounted) return;
        if (books) setBorrowedBooks(books);
        if (stats) {
          const updatedStats = [...statsData];
          updatedStats[0].value = stats.totalActiveBorrows.toString();
          updatedStats[1].value = stats.totalUsers.toString();
          updatedStats[2].value = `${ Math.round(stats.avgBorrowDays) } days`;
          updatedStats[3].value = stats.totalActiveReservations.toString();
          setStatsData(updatedStats);
        }
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

  const borrowData = [
    { month: "Jan", borrows: 120, returns: 115, late: 5 },
    { month: "Feb", borrows: 145, returns: 140, late: 5 },
    { month: "Mar", borrows: 168, returns: 160, late: 8 },
    { month: "Apr", borrows: 192, returns: 185, late: 7 },
    { month: "May", borrows: 210, returns: 205, late: 5 },
    { month: "Jun", borrows: 235, returns: 225, late: 10 },
  ];

  const COLORS = {
    primary: "#4f46e5",
    success: "#22c55e",
    destructive: "#ef4444",
    accent: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
  };

  const bookPopularity = [
    { name: "Fiction", value: 35, color: COLORS.primary },
    { name: "Non-Fiction", value: 25, color: COLORS.purple },
    { name: "Science", value: 20, color: COLORS.pink },
    { name: "History", value: 15, color: COLORS.accent },
    { name: "Biography", value: 5, color: COLORS.success },
  ];

  const topBooks = books.slice(0, 4).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    borrows: Math.floor(Math.random() * 50) + 20,
    rating: book.rating,
    demand: book.demandPressure,
  }));

  const userStats = [
    { level: "Bronze", count: 450, activeUsers: 180 },
    { level: "Silver", count: 320, activeUsers: 245 },
    { level: "Gold", count: 180, activeUsers: 165 },
    { level: "Platinum", count: 45, activeUsers: 42 },
  ];

  const alerts = [
    {
      type: "warning",
      title: "High Demand",
      description: "Project Hail Mary: 8 reservations, only 3 copies",
    },
    {
      type: "alert",
      title: "Late Returns",
      description: "5 users have overdue books beyond grace period",
    },
    {
      type: "info",
      title: "Low Stock",
      description: "6 books below recommended inventory levels",
    },
  ];

  const activeBorrows = borrows.filter((b) => b.status === "active").length;
  const activeReservations = reservations.filter(
    (r) => r.status === "confirmed"
  ).length;

  // const stats = [
  //   {
  //     icon: BookOpen,
  //     label: "Active Borrows",
  //     value: activeBorrows.toString(),
  //     change: "+12 this week",
  //   },
  //   { icon: Users, label: "Total Users", value: "995", change: "+8 new" },
  //   {
  //     icon: Clock,
  //     label: "Avg. Borrow Duration",
  //     value: "16.2 days",
  //     change: "Stable",
  //   },
  //   {
  //     icon: TrendingUp,
  //     label: "Reservations",
  //     value: activeReservations.toString(),
  //     change: "Active now",
  //   },
  // ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview, analytics, and operational intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat:any, index:any) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-4 border-border animate-fadeIn hover:shadow-lg transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <Icon className="w-6 h-6 text-primary opacity-50" />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mb-8 space-y-3">
          {alerts.map((alert, index) => (
            <Card
              key={index}
              className="p-4 border-border flex items-start gap-3 animate-slideIn"
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.type === "warning"
                    ? "text-amber-500"
                    : alert.type === "alert"
                    ? "text-destructive"
                    : "text-primary"
                }`}
              />
              <div>
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="borrowing" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 bg-muted/30">
            <TabsTrigger value="borrowing">Borrowing Trends</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="borrowing" className="space-y-6 mt-6">
            <Card className="p-6 border-border animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4">
                Borrowing Activity (6 months)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={borrowData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="borrows"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Borrows"
                    />
                    <Line
                      type="monotone"
                      dataKey="returns"
                      stroke={COLORS.success}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Returns"
                    />
                    <Line
                      type="monotone"
                      dataKey="late"
                      stroke={COLORS.destructive}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Late"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              className="p-6 border-border animate-fadeIn"
              style={{ animationDelay: "100ms" }}
            >
              <h3 className="text-lg font-semibold mb-4">Top Borrowed Books</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">
                        Book
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
                        Borrows
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        Rating
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        Demand
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 px-4 text-sm text-muted-foreground"
                        >
                          Loading…
                        </td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 px-4 text-sm text-destructive"
                        >
                          Error: {error}
                        </td>
                      </tr>
                    )}
                    {borrowedBooks.map((book) => (
                      <tr
                        key={book.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{book.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {book.author}
                            </p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {book?.borrowCount}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="secondary">
                            {book?.rating?.toString()?.slice(0, 3)}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            className={
                              book?.borrowCount > 10
                                ? "bg-destructive/10 text-destructive"
                                : book?.borrowCount >= 5
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-success/10 text-success"
                            }
                          >
                            {book?.borrowCount > 10
                              ? "High"
                              : book?.borrowCount >= 5
                              ? "Medium"
                              : "Low"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 border-border animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4">
                  Borrowing by Genre
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookPopularity}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={{ stroke: "#6b7280" }}
                      >
                        {bookPopularity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card
                className="p-6 border-border animate-fadeIn"
                style={{ animationDelay: "100ms" }}
              >
                <h3 className="text-lg font-semibold mb-4">Stock Health</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Well Stocked (&gt;70%)
                      </span>
                      <span className="text-sm text-success font-bold">
                        89 books
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-success to-emerald-400 h-full w-[85%] rounded-full transition-all" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Moderate (30-70%)
                      </span>
                      <span className="text-sm text-amber-500 font-bold">
                        34 books
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full w-[35%] rounded-full transition-all" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Low Stock (&lt;30%)
                      </span>
                      <span className="text-sm text-destructive font-bold">
                        6 books
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-destructive to-red-400 h-full w-[8%] rounded-full transition-all" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Titles
                        </p>
                        <p className="text-2xl font-bold">{books.length}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Copies
                        </p>
                        <p className="text-2xl font-bold">
                          {books.reduce((acc, b) => acc + b.totalCopies, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
            <Card className="p-6 border-border animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4">
                User Distribution by Level
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userStats}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="level"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill={COLORS.primary}
                      name="Total Users"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="activeUsers"
                      fill={COLORS.success}
                      name="Active Users"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              className="p-6 border-border animate-fadeIn"
              style={{ animationDelay: "100ms" }}
            >
              <h3 className="text-lg font-semibold mb-4">
                Performance Metrics
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    Average Score
                  </p>
                  <p className="text-4xl font-bold text-primary">7,842</p>
                  <p className="text-xs text-success mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 2.3% from last month
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    On-time Return Rate
                  </p>
                  <p className="text-4xl font-bold text-success">97.7%</p>
                  <p className="text-xs text-success mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 0.4% from last month
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
