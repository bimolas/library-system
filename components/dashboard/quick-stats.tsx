"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle, Clock } from "lucide-react";

export function QuickStats({ user }: { user: any }) {
  console.log("QuickStats user:", user);
  const stats = [
    {
      icon: BookOpen,
      label: "Books Borrowed",
      value: user.borrowCount || "0",
      color: "text-blue-500",
      // human formatted date
      change: `Since ${
        user.createdAt
          ? // human format
            new Date(user.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "2026"
      }`,
    },
    {
      icon: CheckCircle,
      label: "On-Time Returns",
      value: "100%",
      color: "text-green-500",
      change: "Excellent record",
    },
    {
      icon: Clock,
      label: "Avg. Read Time",
      value: "14 days",
      color: "text-amber-500",
      change: "Per book",
    },
  ];

  return (
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-4 border-border animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.change}
                </p>
              </div>
              <Icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
