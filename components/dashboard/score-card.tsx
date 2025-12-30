"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import type { User } from "@/lib/types";

interface ScoreCardProps {
  user: User;
}

export function ScoreCard({ user }: ScoreCardProps) {
  const levelColors: any = {
    bronze: "bg-amber-900/20 text-amber-700 border-amber-200",
    silver: "bg-slate-400/20 text-slate-600 border-slate-300",
    gold: "bg-yellow-400/20 text-yellow-700 border-yellow-300",
    platinum: "bg-blue-400/20 text-blue-600 border-blue-300",
  };

  const borrowedLimit: any = {
    bronze: 5,
    silver: 7,
    gold: 10,
    platinum: 15,
  };

  const levelBenefits: any = {
    bronze: "Starter",
    silver: "Growing",
    gold: "Advanced",
    platinum: "Elite",
  };
  const normalizedTierOrder = ["bronze", "silver", "gold", "platinum"];
  const thresholds: Record<string, number> = {
    bronze: 0,
    silver: 500,
    gold: 1000,
    platinum: 2000,
  };

  const rawTier = String(user?.tier ?? "bronze");
  const normalizedTier = rawTier.toLowerCase();
  const currentScore = Number(user?.currentScore ?? user?.score ?? 0);
  // find tier index (fallback to bronze)
  const currentTierIndex = Math.max(
    0,
    normalizedTierOrder.indexOf(normalizedTier)
  );
  const currentTierKey = normalizedTierOrder[currentTierIndex];
  const currentTierMin = thresholds[currentTierKey] ?? 0;
  const nextTierKey = normalizedTierOrder[currentTierIndex + 1];
  const hasNext = typeof nextTierKey !== "undefined";
  const nextTierMin = hasNext ? thresholds[nextTierKey] : currentTierMin;

  let progressToNext = hasNext
    ? ((currentScore - currentTierMin) /
        Math.max(1, nextTierMin - currentTierMin)) *
      100
    : 100;
  progressToNext =
    Math.round(Math.max(0, Math.min(100, progressToNext)) * 10) / 10;
  const pointsToNext = hasNext
    ? Math.max(0, Math.ceil(nextTierMin - currentScore))
    : 0;

  return (
    <Card className="lg:col-span-1 p-6 border-border bg-gradient-to-br from-card to-secondary/10 animate-fadeIn">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Score
          </h2>
          <p className="text-4xl font-bold mt-2">{user.currentScore}</p>
        </div>
        <Award className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Badge
              className={`${
                user?.tier ? levelColors[user?.tier] : levelColors["bronze"]
              } border`}
            >
              {user?.tier ? levelBenefits[user?.tier] : levelBenefits["bronze"]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {user?.tier?.toUpperCase()}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full transition-smooth"
              style={{
                width: `${
                  isFinite(progressToNext) ? progressToNext.toFixed(1) : 0
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {pointsToNext ?? "_"} points to next level
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Borrow Limit</p>
            <p className="text-lg font-semibold">
              {user.borrowCount}/
              {user.tier
                ? borrowedLimit[user?.tier?.toLowerCase()]
                : borrowedLimit["bronze"]}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-semibold">
              {user?.createdAt
                ? new Date(user.createdAt).getFullYear()
                : "2026"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
