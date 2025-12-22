"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, User } from "lucide-react"

interface ReviewSectionProps {
  bookId: string
}

export function ReviewSection({ bookId }: ReviewSectionProps) {
  const reviews = [
    {
      id: "1",
      author: "Sarah M.",
      rating: 5,
      comment: "An incredible journey! This book kept me reading late into the night.",
      completed: true,
      date: "2 weeks ago",
    },
    {
      id: "2",
      author: "James L.",
      rating: 4,
      comment: "Great storytelling, though some parts felt rushed. Still highly recommended!",
      completed: true,
      date: "1 month ago",
    },
    {
      id: "3",
      author: "Emma T.",
      rating: 5,
      comment: "One of the best books I've read this year. Absolutely transformative.",
      completed: true,
      date: "6 weeks ago",
    },
  ]

  return (
    <Card className="p-6 border-border animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6">Community Reviews</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-border">
          <div>
            <p className="text-4xl font-bold">4.8</p>
            <p className="text-muted-foreground text-sm">out of 5</p>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs w-6">{rating}★</span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{
                        width: `${[95, 70, 40, 10, 5][5 - rating]}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {[95, 70, 40, 10, 5][5 - rating]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full gap-2">Write a Review</Button>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
