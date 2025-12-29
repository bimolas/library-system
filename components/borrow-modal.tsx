"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Calendar, AlertCircle, Info, CheckCircle2, Loader2 } from "lucide-react"
import type { Book } from "@/lib/types"
import { useNotification } from "@/lib/notification-context"
import { useLibrary } from "@/lib/library-context"
import { useAuth } from "@/lib/auth-context"
import { borrowBook } from "@/services/borrow.service"

interface BorrowModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
  userScore: number
  userLevel: string
}

export default function BorrowModal({ book, isOpen, onClose, userScore, userLevel }: BorrowModalProps) {
  const [borrowDays, setBorrowDays] = useState(14)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"select" | "confirm" | "success">("select")
  const { showSuccess, showError } = useNotification()
  // const { borrowBook } = useLibrary()
  const { user } = useAuth()

  const getMaxBorrowDays = () => {
    if (userScore >= 10000) return 35
    if (userScore >= 8000) return 28
    if (userScore >= 5000) return 21
    return 14
  }

  const maxDays = getMaxBorrowDays()
  const returnDate = new Date(Date.now() + borrowDays * 24 * 60 * 60 * 1000)

  const handleProceed = () => {
    setStep("confirm")
  }

  const handleConfirmBorrow = async () => {
    if (!user) {
      showError("You must be logged in to borrow books")
      return
    }

    setIsProcessing(true)
    const result = await borrowBook(book.id, borrowDays)

    if (result) {
      setStep("success")
      showSuccess('Book borrowed successfully!')
      setTimeout(() => {
        onClose()
        setStep("select")
      }, 2000)
    } else {
      showError(result.message)
    }
    setIsProcessing(false)
  }

  const handleClose = () => {
    onClose()
    setStep("select")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-md border-border shadow-2xl animate-scaleIn overflow-hidden">
        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Book Borrowed!</h2>
            <p className="text-muted-foreground mb-4">
              Enjoy reading "{book.title}". Please return by {returnDate.toLocaleDateString()}.
            </p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-semibold text-primary">+50 Score Points Earned</p>
            </div>
          </div>
        ) : step === "confirm" ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Confirm Borrow</h2>
                <p className="text-sm text-muted-foreground">Review your selection</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Book</p>
                <p className="font-semibold">{book.title}</p>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-bold text-primary">{borrowDays} days</p>
                </div>
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">Return By</p>
                  <p className="font-bold text-accent">
                    {returnDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20 flex gap-3">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Late returns will result in -50 score points per day. Make sure to return on time!
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleConfirmBorrow} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Borrow"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Borrow Book</h2>
                <p className="text-sm text-muted-foreground">{book.title}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-success/10 rounded-lg border border-success/30 flex gap-3">
                <Info className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-success">Available Now</p>
                  <p className="text-muted-foreground text-xs">{book.availableCopies} copies in stock</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block">Select Borrow Duration</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {[7, 14, 21, 28, 35].map((days) => (
                    <Button
                      key={days}
                      size="sm"
                      variant={borrowDays === days ? "default" : "outline"}
                      className={`transition-all ${borrowDays === days ? "scale-105 shadow-md" : "bg-transparent hover:scale-105"}`}
                      disabled={days > maxDays}
                      onClick={() => setBorrowDays(days)}
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your <span className="font-semibold capitalize">{userLevel}</span> level allows up to {maxDays} days
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Expected Return Date</p>
                </div>
                <p className="text-lg font-bold text-primary">
                  {returnDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleProceed} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
