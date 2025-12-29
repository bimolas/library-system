"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { getUser } from "@/services/auth.service";

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // updated: include optional rating param
  onSubmit: (text: string, rating: number) => Promise<boolean> | boolean | void;
  initialText?: string;
  initialRating?: number;
  title?: string;
}

export default function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  initialText = "",
  initialRating = 0,
  title = "Write a comment",
}: CommentModalProps) {
  const [text, setText] = useState(initialText);
  const [rating, setRating] = useState<number>(initialRating);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setRating(initialRating ?? 0);
    }
  }, [isOpen, initialText, initialRating]);

  if (!isOpen) return null;

  const user = getUser?.() as any;
  const displayName = user?.name ?? "You";
  const avatarSrc = user?.imageUrl ?? "/profile-avatar.png";

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (rating < 1 || rating > 5) return;
    try {
      setSubmitting(true);
      const res = await onSubmit(text.trim(), rating);
      // if handler returns boolean, only close on true
      if (typeof res === "boolean" ? res : true) {
        onClose();
      }
    } catch (e) {
      console.error("Comment submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>

          {/* author header */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={avatarSrc}
              alt={`${displayName} avatar`}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">Posting as you</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Your rating:</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                  onClick={() => setRating(i)}
                  className="p-1 -m-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${i <= rating ? "fill-accent text-accent" : "text-border"}`}
                  />
                </button>
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">{rating ? `${rating}/5` : "—"}</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full p-3 border border-border rounded resize-y bg-transparent focus:outline-none"
            placeholder="Write your comment here..."
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !text.trim() || rating < 1}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}