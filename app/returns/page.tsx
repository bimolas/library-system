"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, CheckCircle2, X, AlertCircle, Loader2, RotateCcw } from "lucide-react"
import { mockBooks } from "@/lib/mock-data"
import Link from "next/link"
import { useNotification } from "@/lib/notification-context"
import { useConfirmation } from "@/components/confirmation-modal"
import { useLibrary } from "@/lib/library-context"
import { useAuth } from "@/lib/auth-context"

export default function ReturnsPage() {
  const { showSuccess, showError, showInfo } = useNotification()
  const { confirm } = useConfirmation()
  const { borrows, reservations, returnBook, cancelReservation, renewBorrow, getBookById } = useLibrary()
  const { user } = useAuth()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const userBorrows = borrows.filter((b) => b.userId === user?.id && b.status === "active")
  const userReservations = reservations.filter((r) => r.userId === user?.id && r.status !== "cancelled")

  const daysUntilDue = (expectedReturn: Date) => {
    const today = new Date()
    const diff = new Date(expectedReturn).getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleReturnEarly = async (borrowId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Confirm Early Return",
      message: `Do you want to return "${bookTitle}" early? You'll earn +50 bonus points for early returns!`,
      confirmText: "Return Book",
      cancelText: "Cancel",
    })

    if (confirmed) {
      setProcessingId(borrowId)
      const result = await returnBook(borrowId)
      if (result.success) {
        showSuccess(result.message + " You earned +50 bonus points!")
      } else {
        showError(result.message)
      }
      setProcessingId(null)
    }
  }

  const handleRenewBorrow = async (borrowId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Renew Borrow",
      message: `Extend your borrow period for "${bookTitle}" by 7 days?`,
      confirmText: "Renew (+7 days)",
      cancelText: "Cancel",
    })

    if (confirmed) {
      setProcessingId(borrowId)
      const result = await renewBorrow(borrowId, 7)
      if (result.success) {
        showSuccess(result.message)
      } else {
        showError(result.message)
      }
      setProcessingId(null)
    }
  }

  const handleCancelReservation = async (reservationId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Cancel Reservation",
      message: `Are you sure you want to cancel your reservation for "${bookTitle}"? You will lose your queue position and receive -25 score points.`,
      confirmText: "Cancel Reservation",
      cancelText: "Keep Reservation",
      variant: "destructive",
    })

    if (confirmed) {
      setProcessingId(reservationId)
      const result = await cancelReservation(reservationId)
      if (result.success) {
        showInfo(result.message)
      } else {
        showError(result.message)
      }
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Returns & Cancellations</h1>
          <p className="text-muted-foreground">Return books early or cancel reservations</p>
        </div>

        {/* Active Borrows Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Active Borrows ({userBorrows.length})
          </h2>

          <div className="space-y-4">
            {userBorrows.length > 0 ? (
              userBorrows.map((borrow) => {
                const book = getBookById(borrow.bookId) || mockBooks.find((b) => b.id === borrow.bookId)
                const daysLeft = daysUntilDue(borrow.expectedReturnDate)
                const isWarning = daysLeft <= 3
                const isOverdue = daysLeft < 0
                const isProcessing = processingId === borrow.id

                return (
                  <Card key={borrow.id} className="p-6 border-border hover:shadow-lg transition-all animate-fadeIn">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Link href={`/catalog/${book?.id}`}>
                          <div className="w-16 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform cursor-pointer">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/catalog/${book?.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-1 truncate">
                              {book?.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-3">{book?.author}</p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Due Date</p>
                              <p className="font-semibold mt-1">{formatDate(borrow.expectedReturnDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Days Left</p>
                              <p
                                className={`font-semibold mt-1 ${isOverdue ? "text-destructive" : isWarning ? "text-amber-500" : "text-success"}`}
                              >
                                {isOverdue ? `${Math.abs(daysLeft)} overdue` : `${daysLeft} days`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Status</p>
                              {isOverdue ? (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/30 mt-1">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Overdue
                                </Badge>
                              ) : isWarning ? (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 mt-1">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Due Soon
                                </Badge>
                              ) : (
                                <Badge className="bg-success/10 text-success border-success/30 mt-1">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          disabled={isProcessing}
                          onClick={() => handleRenewBorrow(borrow.id, book?.title || "")}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4 mr-1" />
                          )}
                          Renew
                        </Button>
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleReturnEarly(borrow.id, book?.title || "")}
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Return"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-8 border-border text-center animate-fadeIn">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No active borrows</p>
                <Link href="/catalog">
                  <Button variant="outline" className="bg-transparent">
                    Browse Catalog
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Active Reservations Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Active Reservations ({userReservations.length})
          </h2>

          <div className="space-y-4">
            {userReservations.length > 0 ? (
              userReservations.map((reservation) => {
                const book = getBookById(reservation.bookId) || mockBooks.find((b) => b.id === reservation.bookId)
                const isProcessing = processingId === reservation.id

                return (
                  <Card
                    key={reservation.id}
                    className="p-6 border-border hover:shadow-lg transition-all animate-fadeIn"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Link href={`/catalog/${book?.id}`}>
                          <div className="w-16 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform cursor-pointer">
                            <Calendar className="w-8 h-8 text-accent" />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/catalog/${book?.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-1 truncate">
                              {book?.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-3">{book?.author}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Pickup Date</p>
                              <p className="font-semibold mt-1">
                                {new Date(reservation.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Duration</p>
                              <p className="font-semibold mt-1">{reservation.duration} days</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Queue Position</p>
                              <p className="font-semibold mt-1 text-accent">#{reservation.position}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Status</p>
                              <Badge
                                className={
                                  reservation.status === "confirmed"
                                    ? "bg-success/10 text-success border-success/30 mt-1"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/30 mt-1"
                                }
                              >
                                {reservation.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        disabled={isProcessing}
                        onClick={() => handleCancelReservation(reservation.id, book?.title || "")}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-8 border-border text-center animate-fadeIn">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No active reservations</p>
                <Link href="/catalog">
                  <Button variant="outline" className="bg-transparent">
                    Browse Catalog
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
