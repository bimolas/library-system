"use client";

import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Package,
  User,
} from "lucide-react";
import { mockBooks, mockCurrentUser } from "@/lib/mock-data";
import { ReviewSection } from "@/components/book/review-section";
import { AvailabilityCalendar } from "@/components/book/availability-calendar";
import { useEffect, useState } from "react";
import BorrowModal from "@/components/borrow-modal";
import ReserveModal from "@/components/reserve-modal";
import Link from "next/link";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { useParams } from "next/navigation";
import { getBookById } from "@/services/book.service";
import { stat } from "fs";

export default function BookDetailPage() {
  const { books, borrows } = useLibrary();
  const { user } = useAuth();

  // Get book from context or fallback to mock data
  // const book = books[0] || mockBooks[0]
  const currentUser = user || mockCurrentUser;

  const [showCalendar, setShowCalendar] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const params = useParams();
  const id = params?.id;

  const [book, setBook] = useState<any>(books[0] || mockBooks[0]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    count: number;
    average: number;
    distribution: Record<number, number>;
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const ac = new AbortController();
    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await getBookById(id as string);
        if (!mounted) return;
        setBook(data);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        console.error("Failed to load book:", e);
        if (mounted) setFetchError(e?.message || "Failed to load book");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      ac.abort();
    };
  }, [id]);
  const demandColors = {
    low: "bg-success/10 text-success border-success/30",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    high: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const userAlreadyBorrowed = borrows.some(
    (b) =>
      b.userId === currentUser.id &&
      b.bookId === book.id &&
      b.status === "active"
  );

  const borrowedCopies = book.totalCopies - book.availableCopies;
  const remainingBooks = book.availableCopies;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/catalog">
          <Button
            variant="ghost"
            className="mb-6 gap-2 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 animate-fadeIn">
            <Card className="p-6 border-border sticky top-24">
              <div className="w-full h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <BookOpen className="w-20 h-20 text-primary opacity-40" />
              </div>

              <div className="space-y-3 mb-6">
                {book?.availableCopies > 0 && !userAlreadyBorrowed ? (
                  <Button
                    className="w-full hover:scale-[1.02] transition-transform"
                    onClick={() => setShowBorrowModal(true)}
                  >
                    Borrow Now
                  </Button>
                ) : userAlreadyBorrowed ? (
                  <Button className="w-full" disabled>
                    Already Borrowed
                  </Button>
                ) : (
                  <Button
                    className="w-full hover:scale-[1.02] transition-transform"
                    variant="secondary"
                    onClick={() => setShowReserveModal(true)}
                  >
                    Reserve This Book
                  </Button>
                )}

                {/* {book.availableCopies === 0 && !userAlreadyBorrowed && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setShowReserveModal(true)}
                  >
                    Join Waitlist
                  </Button>
                )} */}

                <Button
                  variant="outline"
                  className="w-full bg-transparent hover:bg-primary/5"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {showCalendar ? "Hide Calendar" : "View Availability"}
                </Button>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Availability
                  </p>
                  <div className="space-y-2">
                    <Badge
                      className={`${
                        book?.availableCopies > 0
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-destructive/10 text-destructive border-destructive/30"
                      }`}
                    >
                      {book?.availableCopies > 0
                        ? `${book.availableCopies} available now`
                        : "All copies borrowed"}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {borrowedCopies} of {book?.totalCopies ?? "—"} currently
                        borrowed
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Total Copies
                  </p>
                  <p className="mt-2 font-semibold text-lg">
                    {book.totalCopies}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Demand Level
                  </p>
                  <Badge
                    className={`mt-2 ${
                      book?.demandPressure
                        ? demandColors[
                            book?.demandPressure as keyof typeof demandColors
                          ]
                        : demandColors["low"]
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {(book?.demandPressure ?? "low").charAt(0).toUpperCase() +
                      (book?.demandPressure ?? "low").slice(1)}{" "}
                    Demand
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div
            className="lg:col-span-2 animate-fadeIn"
            style={{ animationDelay: "100ms" }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-3">{book.title}</h1>

              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-primary">
                    {book.author}
                  </p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(stats?.average ?? 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{stats?.average ?? 0}</span>
                  <span className="text-muted-foreground">
                    ({stats?.count ?? 0} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{book.popularity}% readers recommend</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge
                  key={book.genre}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {book.genre}
                </Badge>
              </div>
            </div>

            {/* Book Details Card */}
            <Card className="p-6 border-border mb-8">
              <h2 className="text-lg font-semibold mb-4">About This Book</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {book.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ISBN</p>
                    <p className="font-mono text-sm mt-1">{book.isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="mt-1">English</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Author</p>
                    <p className="mt-1 font-semibold">{book.author}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Available Copies
                    </p>
                    <p className="mt-1">
                      <span
                        className={`font-bold text-lg ${
                          remainingBooks > 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {remainingBooks}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        of {book.totalCopies}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Unavailable Warning */}
            {book.availableCopies === 0 && (
              <Card className="p-6 border-border bg-amber-500/5 border-amber-500/30 mb-8 animate-fadeIn">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">
                      All Copies Currently Borrowed
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This book is highly in demand. Reserve your copy now to
                      get priority access when it becomes available.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your score of{" "}
                      <span className="font-semibold text-primary">
                        {currentUser.score}
                      </span>{" "}
                      gives you
                      <span className="font-semibold text-accent">
                        {" "}
                        {currentUser.level}
                      </span>{" "}
                      priority in the queue.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Calendar */}
            {showCalendar && (
              <Card className="p-6 border-border mb-8 animate-slideIn">
                <h2 className="text-lg font-semibold mb-4">
                  Availability Calendar
                </h2>
                <AvailabilityCalendar book={book} />
              </Card>
            )}
          </div>
        </div>

        <ReviewSection
          bookId={book.id}
          onStats={(stats) => {
            setStats(stats);
          }}
        />
      </main>

      <BorrowModal
        book={book}
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        userScore={currentUser.score}
        userLevel={currentUser.level}
      />

      <ReserveModal
        book={book}
        isOpen={showReserveModal}
        onClose={() => setShowReserveModal(false)}
        userScore={currentUser.score}
        userLevel={currentUser.level}
      />
    </div>
  );
}
