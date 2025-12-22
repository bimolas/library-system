"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Zap, TrendingUp, Calendar, Users, Award } from "lucide-react"

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: "Smart Catalog",
      description: "Browse thousands of books with intelligent availability forecasting",
    },
    {
      icon: Calendar,
      title: "Live Availability",
      description: "View real-time calendars showing when books become available",
    },
    {
      icon: Zap,
      title: "Reputation Score",
      description: "Build your reading score and unlock priority access",
    },
    {
      icon: Award,
      title: "Reservations",
      description: "Reserve books based on your priority and reading history",
    },
    {
      icon: TrendingUp,
      title: "Smart Recommendations",
      description: "AI-powered book suggestions tailored to your reading patterns",
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Discover what readers like you are enjoying",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">LibraryHub</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" className="bg-transparent hover-lift">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="hover-lift">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className={`text-center transition-smooth ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 text-foreground">
            The Future of <span className="text-primary">Library Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            Discover books, track your reading score, and get priority access based on your reputation. Experience the
            next generation of library systems.
          </p>
          <Link href="/catalog">
            <Button size="lg" className="px-8 hover-lift">
              Explore Catalog
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`p-6 border-border hover:border-primary transition-smooth group cursor-pointer animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-smooth" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-muted-foreground">
          <p>&copy; 2025 LibraryHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
