"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, BookOpen } from "lucide-react";
import { mockBorrows, mockBooks } from "@/lib/mock-data";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser } from "@/services/auth.service";
import { getMyBorrowings } from "@/services/borrow.service";

export function ActiveBorrows() {
  const daysUntilDue = (expectedReturn: Date) => {
    const today = new Date();
    const diff = expectedReturn.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleRenew = (borrowId: string) => {
    alert(`Renewal request submitted for borrow ID: ${borrowId}`);
  };

  const [borrows, setBorrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBorrowings("ACTIVE", 3);
        if (!mounted) return;
        const normalized = (data || []).map((b: any) => ({
          ...b,
          expectedReturnDate: b.expectedReturnDate
            ? new Date(b.expectedReturnDate)
            : new Date(),
        }));
        setBorrows(normalized);
      } catch (e: any) {
        console.error("Failed to load borrows:", e);
        if (mounted) setError(e?.message || "Failed to load borrows");
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
        <h3 className="text-lg font-semibold">Currently Borrowing</h3>
        <Link href="/active">
          <Button variant="ghost" size="sm" className="hover-lift">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground p-8">Loading borrows…</p>
        )}
        {error && <p className="text-sm text-destructive">Error: {error}</p>}

        {borrows.map((borrow) => {
          // const book = mockBooks.find((b) => b.id === borrow.bookId)
          const daysLeft = daysUntilDue(new Date(borrow.dueDate));
          const isWarning = daysLeft <= 3;

          return (
            <div
              key={borrow.id}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-smooth"
            >
              <Link href={`/catalog/${borrow.book?.id}`}>
                <div className="w-12 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </Link>

              <div className=" flex-1 min-w-0">
                <Link href={`/catalog/${borrow.book?.id}`}>
                  <h4 className="font-semibold truncate hover:text-primary transition-smooth cursor-pointer">
                    {borrow.book?.title ?? borrow.bookTitle ?? "Unknown book"}
                  </h4>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {borrow.book?.author ?? borrow.bookAuthor}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  {isWarning ? (
                    <Badge
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/30"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Due in {daysLeft} days
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/30"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Due in {daysLeft} days
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Borrowed:{" "}
                  {new Date(borrow.borrowDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 bg-transparent hover-lift"
                onClick={() => handleRenew(borrow.id)}
              >
                Renew
              </Button>
            </div>
          );
        })}

        {!loading && borrows.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No active borrows. Start exploring!
            </p>
            <Link href="/catalog">
              <Button className="hover-lift">Browse Catalog</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
