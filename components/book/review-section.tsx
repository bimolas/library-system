"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import CommentModal from "../comment-modal";
import { createComment, getComments } from "@/services/book.service";
import { useNotification } from "@/lib/notification-context";
import { getUser } from "@/services/auth.service";
import { count } from "console";

interface ReviewSectionProps {
  bookId: string;
  onStats?: (stats: {
    count: number;
    average: number;
    distribution: Record<number, number>;
  }) => void;
}

export function ReviewSection({ bookId, onStats }: ReviewSectionProps) {
  const user = getUser?.() as any;
  const displayName = user?.name ?? "You";
  const avatarSrc = user?.imageUrl ?? "/profile-avatar.png";
  const [showCommentModal, setShowCommentModal] = useState(false);
  const { showNotification } = useNotification();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getComments(bookId);
      // normalize dates if present
      const normalized = (data || []).map((c: any) => ({
        ...c,
        date: c.createdAt ? new Date(c.createdAt) : c.date,
      }));
      setReviews(normalized);
      if (typeof onStats === "function") {
        const count = normalized.length;
        const distribution: Record<number, number> = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };
        let sum = 0;
        for (const r of normalized) {
          const rating = Number(r.rating) || 0;
          if (rating >= 1 && rating <= 5) {
            distribution[rating] = (distribution[rating] || 0) + 1;
            sum += rating;
          }
        }
        const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
        onStats({ count, average, distribution });
      }
    } catch (e: any) {
      console.error("Failed to load comments:", e);
      setFetchError(e?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookId) return;
    loadComments();
  }, [bookId]);

  const submitReview = async (text: string, rating: number) => {
    try {
      const data = await createComment(bookId, text, rating);
      if (data) {
        await loadComments();

        showNotification(
          "success",
          `Your review has been submitted successfully.`
        );
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

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

        <Button
          className="w-full gap-2"
          onClick={() => setShowCommentModal(true)}
        >
          Write a Review
        </Button>

        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground text-center p-6">
              Loading reviews…
            </p>
          )}
          {fetchError && (
            <p className="text-sm text-destructive text-center p-6">
              Error: {fetchError}
            </p>
          )}
          {!loading && reviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center p-6">
              No reviews yet. Be the first to write one!
            </p>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    {review.reviewerName === user.name ? (
                      <img
                        src={avatarSrc}
                        alt={`${displayName} avatar`}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {review.reviewerName ?? "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.createdAt
                        ? // human format
                          new Date(review.createdAt).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "long", day: "numeric" }
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (review.rating ?? 0)
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{review.message}</p>
            </div>
          ))}
        </div>
      </div>
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onSubmit={submitReview}
      />
    </Card>
  );
}
