"use client"

import { Navigation } from "@/components/navigation"
import { ScoreCard } from "@/components/dashboard/score-card"
import { ActiveBorrows } from "@/components/dashboard/active-borrows"
import { ActiveReservations } from "@/components/dashboard/active-reservations"
import { RecommendedBooks } from "@/components/dashboard/recommended-books"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { mockCurrentUser } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {mockCurrentUser.name}!</h1>
          <p className="text-muted-foreground">Here's your library overview for today</p>
        </div>

        {/* Key Stats & Score */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <ScoreCard user={mockCurrentUser} />
          <QuickStats />
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
  )
}
