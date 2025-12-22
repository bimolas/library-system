"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, User, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/types"

interface AvailabilityCalendarProps {
  book: Book
}

const mockBorrowData = [
  { date: 5, type: "borrowed", user: "Alice J.", daysLeft: 3, returnDate: "Dec 20" },
  { date: 8, type: "reserved", user: "Bob M.", position: 1 },
  { date: 12, type: "borrowed", user: "Carol S.", daysLeft: 7, returnDate: "Dec 24" },
  { date: 15, type: "reserved", user: "David K.", position: 2 },
  { date: 18, type: "available", user: null },
  { date: 20, type: "borrowed", user: "Emma L.", daysLeft: 10, returnDate: "Jan 2" },
  { date: 22, type: "available", user: null },
  { date: 25, type: "reserved", user: "Frank H.", position: 3 },
  { date: 28, type: "available", user: null },
]

export function AvailabilityCalendar({ book }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<{ date: number; data: any } | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  const getDateInfo = (date: Date | null) => {
    if (!date) return null
    const day = date.getDate()
    const borrowInfo = mockBorrowData.find((b) => b.date === day)

    const today = new Date()
    if (date < today && date.toDateString() !== today.toDateString()) {
      return { status: "past", info: null }
    }

    if (borrowInfo) {
      return {
        status: borrowInfo.type,
        info: borrowInfo,
      }
    }

    return { status: "available", info: null }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setSelectedDay(null)
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const statusStyles = {
    available:
      "bg-gradient-to-br from-emerald-400/30 to-green-500/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400/50 hover:from-emerald-400/40 hover:to-green-500/40 cursor-pointer shadow-sm hover:shadow-md",
    borrowed:
      "bg-gradient-to-br from-blue-400/30 to-indigo-500/30 text-blue-700 dark:text-blue-300 border-2 border-blue-400/50 hover:from-blue-400/40 hover:to-indigo-500/40 cursor-pointer shadow-sm hover:shadow-md",
    reserved:
      "bg-gradient-to-br from-amber-400/30 to-orange-500/30 text-amber-700 dark:text-amber-300 border-2 border-amber-400/50 hover:from-amber-400/40 hover:to-orange-500/40 cursor-pointer shadow-sm hover:shadow-md",
    past: "bg-muted/20 text-muted-foreground/40 border border-transparent",
    disabled: "bg-transparent border border-transparent",
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{monthName}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={prevMonth} className="bg-transparent hover:bg-muted">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={nextMonth} className="bg-transparent hover:bg-muted">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-muted-foreground py-3 uppercase tracking-wide">
              {day}
            </div>
          ))}

          {days.map((date, index) => {
            const dateInfo = getDateInfo(date)

            return (
              <div
                key={index}
                onClick={() => {
                  if (date && dateInfo && dateInfo.status !== "past") {
                    setSelectedDay({ date: date.getDate(), data: dateInfo })
                  }
                }}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${statusStyles[dateInfo?.status || "disabled"]}`}
              >
                {date && (
                  <>
                    <span className="font-bold text-sm">{date.getDate()}</span>
                    {dateInfo?.info && (
                      <div className="mt-0.5">
                        {dateInfo.status === "borrowed" && <BookOpen className="w-3 h-3 opacity-70" />}
                        {dateInfo.status === "reserved" && <Clock className="w-3 h-3 opacity-70" />}
                        {dateInfo.status === "available" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
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
                    {currentDate.toLocaleDateString("en-US", { month: "long" })} {selectedDay.date}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedDay.data.status}</p>
                </div>
                {selectedDay.data.info?.user && (
                  <Badge variant="outline" className="bg-card">
                    {selectedDay.data.info.user}
                  </Badge>
                )}
              </div>

              {selectedDay.data.status === "available" && (
                <p className="text-sm text-emerald-600 font-medium">This day is available for borrowing!</p>
              )}
              {selectedDay.data.status === "borrowed" && selectedDay.data.info && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Expected return: <span className="font-semibold">{selectedDay.data.info.returnDate}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Days until return:{" "}
                    <span className="font-semibold text-blue-600">{selectedDay.data.info.daysLeft}</span>
                  </p>
                </div>
              )}
              {selectedDay.data.status === "reserved" && selectedDay.data.info && (
                <p className="text-sm text-muted-foreground">
                  Queue position:{" "}
                  <span className="font-semibold text-amber-600">#{selectedDay.data.info.position}</span>
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Next Available Info */}
      {book.nextAvailableDate && (
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next available date</p>
              <p className="text-lg font-bold text-primary">
                {new Date(book.nextAvailableDate).toLocaleDateString("en-US", {
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
  )
}
