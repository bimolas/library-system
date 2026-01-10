"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, BookMarked, TrendingUp } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import Link from "next/link";
import { useEffect, useState } from "react";
import BorrowModal from "@/components/borrow-modal";
import ReserveModal from "@/components/reserve-modal";
import { mockCurrentUser } from "@/lib/mock-data";
import { getMyRecommendedBooks } from "@/services/book.service";
import { BASE_URL } from "@/lib/utils";

export function RecommendedBooks() {
  // const recommendedBooks = mockBooks.slice(0, 4)
  const [selectedBook, setSelectedBook] = useState<
    (typeof mockBooks)[0] | null
  >(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const booksData = await getMyRecommendedBooks();

        if (!mounted) return;
        if (booksData && booksData.length > 0) {
          setRecommendedBooks(booksData);
        }
      } catch (e: any) {
        console.error("Failed to load dashboard data:", e);
        if (mounted) setError(e?.message || "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBookAction = (book: (typeof mockBooks)[0]) => {
    setSelectedBook(book);
    if (book.availableCopies > 0) {
      setShowBorrowModal(true);
    } else {
      setShowReserveModal(true);
    }
  };

  return (
    <>
      <Card className="p-6 border-border animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recommended For You</h3>
          <Link href="/recommendations">
            <Button variant="ghost" size="sm" className="hover-lift gap-2">
              <TrendingUp className="w-4 h-4" />
              See All
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto -mx-2 py-2">
          <div className="flex gap-4 px-2 min-w-max">
            {loading && (
              <div className="px-4 flex items-center">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            )}
            {error && (
              <div className="px-4 flex items-center">
                <p className="text-sm text-destructive">Error: {error}</p>
              </div>
            )}

            {recommendedBooks.slice(0, 15).map((book, index) => (
              <div
                key={book.id}
                className="pb-5 group cursor-pointer animate-fadeIn min-w-[160px] sm:min-w-[180px] md:min-w-[200px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/catalog/${book.id}`}>
                  <div className="w-70 h-110 relative mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 aspect-[3/4] flex items-center justify-center hover-lift">
                    {book?.coverImage?.startsWith(BASE_URL) ||
                    book?.coverImage?.startsWith("https://covers") ? (
                      <img
                        src={book.coverImage}
                        className="w-full h-full object-cover block text-primary   transition-smooth"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                    <BookMarked className="w-12 h-12 text-primary opacity-40 group-hover:scale-105 transition-smooth" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">
                      {book.demandPressure > 80 ? "High Demand" : "Recommended"}
                    </Badge>
                  </div>
                </Link>

                <Link href={`/catalog/${book.id}`}>
                  <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-smooth w-70">
                    {book?.title?.length > 30
                      ? book?.title?.slice(0, 30) + "..."
                      : book?.title}
                  </h4>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {book.author}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(book.rating)
                            ? "fill-accent text-accent"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(book.rating ?? "").toString().slice(0, 3)}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 hover-lift"
                    variant={book.availableCopies > 0 ? "default" : "outline"}
                    onClick={() => handleBookAction(book)}
                  >
                    {book.availableCopies > 0 ? "Borrow" : "Reserve"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {selectedBook && (
        <>
          <BorrowModal
            book={selectedBook}
            isOpen={showBorrowModal}
            onClose={() => {
              setShowBorrowModal(false);
              setSelectedBook(null);
            }}
            userScore={mockCurrentUser.score}
            userLevel={mockCurrentUser.level}
          />
          <ReserveModal
            book={selectedBook}
            isOpen={showReserveModal}
            onClose={() => {
              setShowReserveModal(false);
              setSelectedBook(null);
            }}
            userScore={mockCurrentUser.score}
            userLevel={mockCurrentUser.level}
          />
        </>
      )}
    </>
  );
}
