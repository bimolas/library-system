"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Calendar, Users, Zap, CheckCircle2, Loader2 } from "lucide-react";
import type { Book } from "@/lib/types";
import { useNotification } from "@/lib/notification-context";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { getMyReservations, reserveBook } from "@/services/reservations.service";


interface ReserveModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  userScore: number;
  userLevel: string;
}

export default function ReserveModal({
  book,
  isOpen,
  onClose,
  userScore,
  userLevel,
}: ReserveModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [borrowDuration, setBorrowDuration] = useState(14);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [queuePosition, setQueuePosition] = useState(1);
  const { showSuccess, showError } = useNotification();
    const [reservations, setReservations] = useState<any[]>([]);

  // const { existingReservations, setExistingReservations } = useState<any[]>([]);
  // const { reserveBook, reservations } = useLibrary()
  const { user } = useAuth();
  const existingReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.bookId === book.id && r.status !== "cancelled")
        .sort(
          (a, b) =>
            new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        ),
    [reservations, book.id]
  );

  // If the current user already has a reservation, show their real position
  const userReservation = useMemo(
    () => (user ? existingReservations.find((r) => r.userId === user.id) : undefined),
    [existingReservations, user?.id]
  );

  const estimatedPosition = useMemo(() => {
    if (userReservation) {
      return Math.max(1, existingReservations.findIndex((r) => r.id === userReservation.id) + 1);
    }
    return existingReservations.length + 1;
  }, [existingReservations, userReservation]);
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadReservations = async () => {
      try {
        const data = await getMyReservations();
        if (!cancelled) setReservations(data);
      } catch (err) {
        showError((err as Error)?.message || "Unable to load reservations");
      }
    };

    loadReservations();
    return () => {
      cancelled = true;
    };
  }, [isOpen, book.id, showError, setReservations, book]);

  // refresh reservations after a successful reservation (step changes to "success")
  useEffect(() => {
    if (step === "success" && isOpen) {
      (async () => {
        try {
          const data = await getMyReservations();
          setReservations(data);
        } catch {
          // ignore refresh errors
        }
      })();
    }
  }, [step, isOpen, book.id]);
  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const startDate =
      book.nextAvailableDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 7);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleProceed = () => {
    if (!selectedDate) {
      showError("Please select a date for your reservation");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmReserve = async () => {
    if (!user || !selectedDate) {
      showError("Please select a date and ensure you are logged in");
      return;
    }

    setIsProcessing(true);
    const result = await reserveBook(
      book.id,
      borrowDuration,
      selectedDate.toISOString()
    );
    if (result) {
      setQueuePosition(result.position || estimatedPosition);
      setStep("success");
      showSuccess('Book reserved successfully!');
      setTimeout(() => {
        onClose();
        setStep("select");
        setSelectedDate(null);
      }, 2500);
    } else {
      showError(result.message);
    }
    setIsProcessing(false);
  };

  const handleClose = () => {
    onClose();
    setStep("select");
    setSelectedDate(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-md border-border shadow-2xl animate-scaleIn overflow-hidden">
        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reserved!</h2>
            <p className="text-muted-foreground mb-4">
              You are #{queuePosition} in queue for "{book.title}"
            </p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Expected pickup date:
              </p>
              <p className="font-bold text-primary">
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        ) : step === "confirm" ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Confirm Reservation</h2>
                <p className="text-sm text-muted-foreground">
                  Review your selection
                </p>
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
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Queue Position
                  </p>
                  <p className="font-bold text-2xl text-accent">
                    #{estimatedPosition}
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Pickup Date
                  </p>
                  <p className="font-bold text-primary">
                    {selectedDate?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border flex gap-3">
                <Zap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  You will be notified when the book is ready for pickup.
                  Reservations not collected within 3 days will be cancelled.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmReserve}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Reservation"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Reserve Book</h2>
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
              <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    <span className="font-semibold">Your Queue Position</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-accent">
                      #{estimatedPosition}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {existingReservations.length} ahead of you
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block">
                  Select Pickup Date
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableDates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedDate?.getTime() === date.getTime()
                          ? "border-primary bg-primary/10 shadow-md scale-[1.02]"
                          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Available for pickup
                          </p>
                        </div>
                        <Calendar
                          className={`w-5 h-5 ${
                            selectedDate?.getTime() === date.getTime()
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block">
                  Borrow Duration
                </label>
                <div className="flex gap-2">
                  {[7, 14, 21].map((days) => (
                    <Button
                      key={days}
                      size="sm"
                      variant={borrowDuration === days ? "default" : "outline"}
                      className={`flex-1 ${
                        borrowDuration !== days ? "bg-transparent" : ""
                      }`}
                      onClick={() => setBorrowDuration(days)}
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceed}
                disabled={!selectedDate}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
