"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Bell } from "lucide-react"
import { mockReservations, mockBooks } from "@/lib/mock-data"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getMyReservations } from "@/services/reservations.service"

export function ActiveReservations() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleNotify = (reservationId: string) => {
    alert(`Notifications enabled for reservation ${reservationId}. You'll be notified when it's ready.`)
  }

   const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getMyReservations(3);

          if (!mounted) return;
          const normalized = (data || []).map((b: any) => ({
            ...b,
            expectedReturnDate: b.expectedReturnDate
              ? new Date(b.expectedReturnDate)
              : new Date(),
          }));
          setReservations(normalized);
        } catch (e: any) {
          console.error("Failed to load reservation:", e);
          if (mounted) setError(e?.message || "Failed to load reservation");
        } finally {
          if (mounted) setLoading(false);
        }
      };
  
      load();
      return () => {
        mounted = false;
      };
    }, []);
  

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
        {loading && (
          <p className="text-sm text-muted-foreground p-8">Loading reservations…</p>
        )}
        {error && <p className="text-sm text-destructive">Error: {error}</p>}
        {reservations.map((reservation) => {
          return (
            <div
              key={reservation.id}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-smooth"
            >
              <Link href={`/catalog/${reservation.book?.id}`}>
                <div className="w-12 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/catalog/${reservation.book?.id}`}>
                  <h4 className="font-semibold truncate hover:text-primary transition-smooth cursor-pointer">
                    {reservation.book?.title}
                  </h4>
                </Link>
                <p className="text-sm text-muted-foreground">{reservation.book?.author}</p>

                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Position: #{reservation.priority}
                    </Badge>
                    <span className="text-muted-foreground"> total</span>
                  </div>

                  <p className="text-xs text-muted-foreground">Available: {formatDate(new Date(reservation.startDate))}</p>
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
