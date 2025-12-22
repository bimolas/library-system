"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, AlertCircle, CheckCircle2, X } from "lucide-react"
import { mockBorrows, mockReservations, mockBooks } from "@/lib/mock-data"
import Link from "next/link"
import { useNotification } from "@/lib/notification-context"
import { useConfirmation } from "@/components/confirmation-modal"

export default function ActivePage() {
  const [activeTab, setActiveTab] = useState("borrows")
  const { showNotification } = useNotification()
  const { confirm } = useConfirmation()

  const daysUntilDue = (expectedReturn: Date) => {
    const today = new Date()
    const diff = expectedReturn.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleRenew = async (borrowId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Renew Book",
      message: `Do you want to renew "${bookTitle}"? This will extend your borrowing period by 14 days.`,
      confirmText: "Renew",
      cancelText: "Cancel",
    })

    if (confirmed) {
      showNotification(`Successfully renewed "${bookTitle}" for 14 more days!`, "success")
    }
  }

  const handleReturn = async (borrowId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Confirm Return",
      message: `Are you ready to return "${bookTitle}"? Please bring the book to the library desk.`,
      confirmText: "Confirm Return",
      cancelText: "Cancel",
    })

    if (confirmed) {
      showNotification(`Return confirmed for "${bookTitle}". Please bring it to the library desk.`, "success")
    }
  }

  const handleCancelReservation = async (reservationId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Cancel Reservation",
      message: `Are you sure you want to cancel your reservation for "${bookTitle}"?`,
      confirmText: "Cancel Reservation",
      cancelText: "Keep It",
      variant: "destructive",
    })

    if (confirmed) {
      showNotification(`Reservation for "${bookTitle}" has been cancelled.`, "info")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">My Activity</h1>
          <p className="text-muted-foreground">Manage your borrows, reservations, and reading history</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 bg-muted/30">
            <TabsTrigger value="borrows" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Currently Borrowing</span>
              <span className="sm:hidden">Borrows</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Reservations</span>
              <span className="sm:hidden">Reserved</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrows" className="mt-6 space-y-4 animate-fadeIn">
            {mockBorrows.length > 0 ? (
              mockBorrows.map((borrow) => {
                const book = mockBooks.find((b) => b.id === borrow.bookId)
                const daysLeft = daysUntilDue(borrow.expectedReturnDate)
                const isWarning = daysLeft <= 3
                const isOverdue = daysLeft < 0

                return (
                  <Card key={borrow.id} className="p-6 border-border hover:border-primary transition-smooth">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Link href={`/catalog/${book?.id}`}>
                          <div className="w-16 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/catalog/${book?.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-smooth cursor-pointer">
                              {book?.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{book?.author}</p>

                          <div className="flex gap-2 mt-3 flex-wrap">
                            <Badge variant="outline" className="bg-muted/50">
                              Borrowed: {formatDate(borrow.startDate)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {isOverdue ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {Math.abs(daysLeft)} days overdue
                          </Badge>
                        ) : isWarning ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Due in {daysLeft} days
                          </Badge>
                        ) : (
                          <Badge className="bg-success/10 text-success border-success/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Due in {daysLeft} days
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Due Date</p>
                        <p className="font-semibold mt-1">{formatDate(borrow.expectedReturnDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Days Left</p>
                        <p
                          className={`font-semibold mt-1 ${isOverdue ? "text-destructive" : isWarning ? "text-destructive" : "text-success"}`}
                        >
                          {isOverdue ? `-${Math.abs(daysLeft)}` : daysLeft} days
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent hover-lift"
                          onClick={() => handleRenew(borrow.id, book?.title || "")}
                        >
                          Renew
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent hover-lift"
                          onClick={() => handleReturn(borrow.id, book?.title || "")}
                        >
                          Return
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-12 border-border text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No active borrows</p>
                <Link href="/catalog">
                  <Button className="gap-2 hover-lift">
                    <BookOpen className="w-4 h-4" />
                    Browse Catalog
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="mt-6 space-y-4 animate-fadeIn">
            {mockReservations.length > 0 ? (
              mockReservations.map((reservation) => {
                const book = mockBooks.find((b) => b.id === reservation.bookId)

                return (
                  <Card key={reservation.id} className="p-6 border-border hover:border-primary transition-smooth">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Link href={`/catalog/${book?.id}`}>
                          <div className="w-16 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                            <Calendar className="w-8 h-8 text-accent" />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/catalog/${book?.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-smooth cursor-pointer">
                              {book?.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{book?.author}</p>

                          <div className="flex gap-2 mt-3 flex-wrap">
                            <Badge
                              variant="outline"
                              className={
                                reservation.status === "confirmed"
                                  ? "bg-success/10 text-success border-success/30"
                                  : "bg-warning/10 text-warning border-warning/30"
                              }
                            >
                              {reservation.status === "confirmed" ? "Confirmed" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">#{reservation.position}</p>
                        <p className="text-xs text-muted-foreground">in queue</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Available</p>
                        <p className="font-semibold mt-1">
                          {reservation.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Duration</p>
                        <p className="font-semibold mt-1">{reservation.duration} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Total Reserved</p>
                        <p className="font-semibold mt-1">{reservation.totalReservations}</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Link href={`/catalog/${book?.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent hover-lift">
                            Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover-lift"
                          onClick={() => handleCancelReservation(reservation.id, book?.title || "")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <Card className="p-12 border-border text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No active reservations</p>
                <Link href="/catalog">
                  <Button className="gap-2 hover-lift">
                    <Calendar className="w-4 h-4" />
                    Make a Reservation
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6 animate-fadeIn">
            <Card className="p-6 border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gradient-to-br from-green-500/20 to-success/20 rounded flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold">The Midnight Library</p>
                      <p className="text-sm text-muted-foreground">Returned on Dec 10, 2024</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/30">+150 points</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gradient-to-br from-green-500/20 to-success/20 rounded flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold">Atomic Habits</p>
                      <p className="text-sm text-muted-foreground">Returned on Nov 28, 2024</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/30">+200 points</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gradient-to-br from-red-500/20 to-destructive/20 rounded flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">The Silent Patient</p>
                      <p className="text-sm text-muted-foreground">Returned late on Oct 15, 2024</p>
                    </div>
                  </div>
                  <Badge className="bg-destructive/10 text-destructive border-destructive/30">-50 points</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
