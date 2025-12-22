"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import type { User } from "@/lib/types"

interface ScoreCardProps {
  user: User
}

export function ScoreCard({ user }: ScoreCardProps) {
  const levelColors = {
    bronze: "bg-amber-900/20 text-amber-700 border-amber-200",
    silver: "bg-slate-400/20 text-slate-600 border-slate-300",
    gold: "bg-yellow-400/20 text-yellow-700 border-yellow-300",
    platinum: "bg-blue-400/20 text-blue-600 border-blue-300",
  }

  const levelBenefits = {
    bronze: "Starter",
    silver: "Growing",
    gold: "Advanced",
    platinum: "Elite",
  }

  const nextLevelScore = 10000
  const progressPercentage = (user.score / nextLevelScore) * 100

  return (
    <Card className="lg:col-span-1 p-6 border-border bg-gradient-to-br from-card to-secondary/10 animate-fadeIn">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Score</h2>
          <p className="text-4xl font-bold mt-2">{user.score.toLocaleString()}</p>
        </div>
        <Award className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Badge className={`${levelColors[user.level]} border`}>{levelBenefits[user.level]}</Badge>
            <span className="text-xs text-muted-foreground">{user.level.toUpperCase()}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full transition-smooth"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{nextLevelScore - user.score} points to next level</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Borrow Limit</p>
            <p className="text-lg font-semibold">
              {user.activeBorrows}/{user.borrowingLimit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-semibold">{user.joinedDate.getFullYear()}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
