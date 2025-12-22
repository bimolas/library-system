"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Bell } from "lucide-react"
import { mockReservations, mockBooks } from "@/lib/mock-data"
import Link from "next/link"

export function ActiveReservations() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleNotify = (reservationId: string) => {
    alert(`Notifications enabled for reservation ${reservationId}. You'll be notified when it's ready.`)
  }

  return (
    <Card className="p-6 border-border animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reserved Books</h3>
        <Link href="/active?tab=reservations">
          <Button variant="ghost" size="sm" className="hover-lift">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {mockReservations.map((reservation) => {
          const book = mockBooks.find((b) => b.id === reservation.bookId)

          return (
            <div
              key={reservation.id}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-smooth"
            >
              <Link href={`/catalog/${book?.id}`}>
                <div className="w-12 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/catalog/${book?.id}`}>
                  <h4 className="font-semibold truncate hover:text-primary transition-smooth cursor-pointer">
                    {book?.title}
                  </h4>
                </Link>
                <p className="text-sm text-muted-foreground">{book?.author}</p>

                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Position: #{reservation.position}
                    </Badge>
                    <span className="text-muted-foreground">{reservation.totalReservations} total</span>
                  </div>

                  <p className="text-xs text-muted-foreground">Available: {formatDate(reservation.startDate)}</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 gap-2 bg-transparent hover-lift"
                onClick={() => handleNotify(reservation.id)}
              >
                <Bell className="w-3 h-3" />
                Notify
              </Button>
            </div>
          )
        })}

        {mockReservations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No reservations yet.</p>
            <Link href="/catalog">
              <Button className="hover-lift">Browse Catalog</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
