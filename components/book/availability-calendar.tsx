"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, User, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/lib/types";

interface BorrowEntry {
  id?: string;
  user?: string;
  startDate: string | Date;
  returnDate: string | Date;
  userName?: string;
}

interface ReservationEntry {
  id?: string;
  user?: string;
  startDate: string | Date;
  // optional end date for reservation window or expected borrow start
  returnDate?: string | Date;
  position?: number;
}

interface AvailabilityCalendarProps {
  book: Book & {
    borrows?: BorrowEntry[];
    reservations?: ReservationEntry[];
  };
}

/**
 * Availability calendar that derives each day's status from actual borrows and reservations.
 * Priority: borrowed > reserved > available. Past days marked as past.
 */
export function AvailabilityCalendar({ book }: any) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<{
    date: number;
    data: any;
  } | null>(null);

  // helpers to normalize date (midnight)
  const toDateOnly = (d: string | Date) => {
    const dt = typeof d === "string" ? new Date(d) : new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  };

  const isBetweenInclusive = (d: Date, start: Date, end: Date) => {
    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
  };

  const borrows: BorrowEntry[] = (book.borrows || []).map((b: any) => ({
    ...b,
    startDate: toDateOnly(b.borrowDate),
    returnDate: toDateOnly(b.dueDate),
  }));

  const reservations: ReservationEntry[] = (book.reservations || []).map(
    (r: any) => ({
      ...r,
      startDate: toDateOnly(r.reservedAt),
      returnDate: r.endDate ? toDateOnly(r.endDate) : undefined,
    })
  );

  const nextAvailableDate = useMemo(() => {
    const totalCopies = Math.max(1, Number(book.totalCopies ?? 1));
    const today = toDateOnly(new Date());
    const keyFor = (d: Date) => toDateOnly(d).toISOString().slice(0, 10); // yyyy-mm-dd

    const deltas = new Map<string, number>();
    const addDelta = (date: Date, delta: number) => {
      const k = keyFor(date);
      deltas.set(k, (deltas.get(k) || 0) + delta);
    };

    // mark occupancy: +1 at start, -1 at (end + 1 day)
    for (const b of borrows) {
      const s = toDateOnly(new Date(b.startDate as Date));
      const e = toDateOnly(new Date(b.returnDate as Date));
      addDelta(s, 1);
      const after = new Date(e);
      after.setDate(after.getDate() + 1);
      addDelta(after, -1);
    }

    // treat reservations as occupying a copy for their window (if end missing, single day)
    for (const r of reservations) {
      const s = toDateOnly(new Date(r.startDate as Date));
      const e = r.returnDate ? toDateOnly(new Date(r.returnDate as Date)) : s;
      addDelta(s, 1);
      const after = new Date(e);
      after.setDate(after.getDate() + 1);
      addDelta(after, -1);
    }

    // compute running occupancy at end of each day; find first day >= today with running < totalCopies
    const sortedKeys = Array.from(deltas.keys()).sort();
    let running = 0;
    const todayKey = keyFor(today);

    // initial running = sum of deltas for keys <= todayKey
    for (const k of sortedKeys) {
      if (k <= todayKey) running += deltas.get(k) ?? 0;
    }

    if (running < totalCopies) return today;

    for (let i = 1; i <= 365; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const k = keyFor(d);
      if (deltas.has(k)) running += deltas.get(k) ?? 0;
      if (running < totalCopies) return d;
    }

    return null;
  }, [borrows, reservations, book.totalCopies]);

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // build calendar grid (null placeholders then Date objects)
  const calendarDays = useMemo(() => {
    const total = daysInMonth(currentDate);
    const first = firstDayOfMonth(currentDate);
    const arr: (Date | null)[] = [];
    for (let i = 0; i < first; i++) arr.push(null);
    for (let d = 1; d <= total; d++)
      arr.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
    return arr;
  }, [currentDate]);

  const getDateInfo = (date: Date | null) => {
    if (!date) return null;
    const today = toDateOnly(new Date());
    const d = toDateOnly(date);

    if (d.getTime() < today.getTime()) {
      return { status: "past", items: [] as any[] };
    }

    const matchedBorrows = borrows.filter((b) =>
      isBetweenInclusive(d, b.startDate as Date, b.returnDate as Date)
    );

    if (matchedBorrows.length > 0) {
      // if multiple borrows on same date, return them all
      return { status: "borrowed", items: matchedBorrows };
    }

    // reservations that include this date OR reservations that start this date
    const matchedReservations = reservations.filter((r) => {
      if (r.returnDate) {
        return isBetweenInclusive(d, r.startDate as Date, r.returnDate as Date);
      }
      // no returnDate -> treat reservation as a single-day marker (start)
      return toDateOnly(r.startDate).getTime() === d.getTime();
    });

    if (matchedReservations.length > 0) {
      return { status: "reserved", items: matchedReservations };
    }

    return { status: "available", items: [] as any[] };
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
    setSelectedDay(null);
  };

  const statusStyles: Record<string, string> = {
    available:
      "bg-gradient-to-br from-emerald-400/30 to-green-500/30 text-emerald-700 border-2 border-emerald-400/50 hover:from-emerald-400/40 hover:to-green-500/40 cursor-pointer shadow-sm hover:shadow-md",
    borrowed:
      "bg-gradient-to-br from-blue-400/30 to-indigo-500/30 text-blue-700 border-2 border-blue-400/50 hover:from-blue-400/40 hover:to-indigo-500/40 cursor-pointer shadow-sm hover:shadow-md",
    reserved:
      "bg-gradient-to-br from-amber-400/30 to-orange-500/30 text-amber-700 border-2 border-amber-400/50 hover:from-amber-400/40 hover:to-orange-500/40 cursor-pointer shadow-sm hover:shadow-md",
    past: "bg-muted/20 text-muted-foreground/40 border border-transparent",
    disabled: "bg-transparent border border-transparent",
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{monthName}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={prevMonth}
              className="bg-transparent hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={nextMonth}
              className="bg-transparent hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-muted-foreground py-3 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            const dateInfo = getDateInfo(date);

            return (
              <div
                key={index}
                onClick={() => {
                  if (date && dateInfo && dateInfo.status !== "past") {
                    setSelectedDay({ date: date.getDate(), data: dateInfo });
                  }
                }}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                  statusStyles[dateInfo?.status || "disabled"]
                }`}
              >
                {date && (
                  <>
                    <span className="font-bold text-sm">{date.getDate()}</span>
                    {dateInfo?.items?.length ? (
                      <div className="mt-0.5 text-[10px]">
                        {dateInfo.status === "borrowed" && (
                          <BookOpen className="w-3 h-3 opacity-70 inline-block" />
                        )}
                        {dateInfo.status === "reserved" && (
                          <Clock className="w-3 h-3 opacity-70 inline-block" />
                        )}

                        <div className="text-[10px] mt-1">
                          {dateInfo.status === "borrowed"
                            ? "Borrowed"
                            : dateInfo.status === "reserved"
                            ? "Reserved"
                            : ""}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-0.5">
                        {dateInfo?.status === "ACTIVE" && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400/30 to-green-500/30 border-2 border-emerald-400/50 rounded-lg" />
          <span className="text-sm font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 border-2 border-blue-400/50 rounded-lg" />
          <span className="text-sm font-medium">Borrowed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-amber-400/30 to-orange-500/30 border-2 border-amber-400/50 rounded-lg" />
          <span className="text-sm font-medium">Reserved</span>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 animate-slideIn">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedDay.data.status === "available"
                  ? "bg-emerald-500/20"
                  : selectedDay.data.status === "borrowed"
                  ? "bg-blue-500/20"
                  : "bg-amber-500/20"
              }`}
            >
              {selectedDay.data.status === "available" ? (
                <BookOpen className="w-6 h-6 text-emerald-600" />
              ) : selectedDay.data.status === "borrowed" ? (
                <User className="w-6 h-6 text-blue-600" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-lg">
                    {currentDate.toLocaleDateString("en-US", { month: "long" })}{" "}
                    {selectedDay.date}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedDay.data.status}
                  </p>
                </div>
                {selectedDay.data.items?.[0]?.user && (
                  <Badge variant="outline" className="bg-card">
                    {selectedDay.data.items[0].user}
                  </Badge>
                )}
              </div>

              {selectedDay.data.status === "available" && (
                <p className="text-sm text-emerald-600 font-medium">
                  This day is available for borrowing.
                </p>
              )}

              {selectedDay.data.status === "borrowed" &&
                selectedDay.data.items && (
                  <div className="space-y-1">
                    {selectedDay.data.items.map((b: BorrowEntry, i: number) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        <div>
                          Borrowed by:{" "}
                          <span className="font-semibold">
                            {b.userName ?? "Unknown"}
                          </span>
                        </div>
                        <div>
                          From:{" "}
                          <span className="font-semibold">
                            {toDateOnly(b.startDate).toLocaleDateString(
                              undefined,
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </span>{" "}
                          — To:{" "}
                          <span className="font-semibold">
                            {toDateOnly(b.returnDate).toLocaleDateString( undefined, 
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {selectedDay.data.status === "reserved" &&
                selectedDay.data.items && (
                  <div className="space-y-1">
                    {selectedDay.data.items.map(
                      (r: ReservationEntry, i: number) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          <div>
                            Reserved by:{" "}
                            <span className="font-semibold">
                              {r.user ?? "Unknown"}
                            </span>
                            {r.position ? (
                              <span className="ml-2 text-xs text-muted-foreground">
                                #{r.position}
                              </span>
                            ) : null}
                          </div>
                          <div>
                            From:{" "}
                            <span className="font-semibold">
                              {toDateOnly(r.startDate).toLocaleDateString()}
                            </span>
                            {r.returnDate ? (
                              <>
                                {" "}
                                — To:{" "}
                                <span className="font-semibold">
                                  {toDateOnly(
                                    r.returnDate
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        </Card>
      )}

      {/* Next Available Info */}
      {nextAvailableDate && (
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Next available date
              </p>
              <p className="text-lg font-bold text-primary">
                {new Date(nextAvailableDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
