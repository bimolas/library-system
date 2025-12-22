"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Book, Borrow, Reservation } from "@/lib/types"
import {
  mockBooks as initialBooks,
  mockBorrows as initialBorrows,
  mockReservations as initialReservations,
} from "@/lib/mock-data"

interface LibraryContextType {
  books: Book[]
  borrows: Borrow[]
  reservations: Reservation[]
  borrowBook: (bookId: string, userId: string, duration: number) => Promise<{ success: boolean; message: string }>
  returnBook: (borrowId: string) => Promise<{ success: boolean; message: string }>
  reserveBook: (
    bookId: string,
    userId: string,
    date: Date,
    duration: number,
  ) => Promise<{ success: boolean; message: string; position?: number }>
  cancelReservation: (reservationId: string) => Promise<{ success: boolean; message: string }>
  renewBorrow: (borrowId: string, extraDays: number) => Promise<{ success: boolean; message: string }>
  getUserBorrows: (userId: string) => Borrow[]
  getUserReservations: (userId: string) => Reservation[]
  getBookById: (bookId: string) => Book | undefined
  addBook: (book: Omit<Book, "id">) => Promise<{ success: boolean; message: string }>
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<{ success: boolean; message: string }>
  deleteBook: (bookId: string) => Promise<{ success: boolean; message: string }>
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [borrows, setBorrows] = useState<Borrow[]>(initialBorrows)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)

  // Load from localStorage on mount
  useEffect(() => {
    const storedBooks = localStorage.getItem("library_books")
    const storedBorrows = localStorage.getItem("library_borrows")
    const storedReservations = localStorage.getItem("library_reservations")

    if (storedBooks) setBooks(JSON.parse(storedBooks))
    if (storedBorrows)
      setBorrows(
        JSON.parse(storedBorrows, (key, value) => {
          if (key === "startDate" || key === "expectedReturnDate" || key === "actualReturnDate") {
            return value ? new Date(value) : null
          }
          return value
        }),
      )
    if (storedReservations)
      setReservations(
        JSON.parse(storedReservations, (key, value) => {
          if (key === "requestedDate" || key === "startDate") {
            return value ? new Date(value) : null
          }
          return value
        }),
      )
  }, [])

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem("library_books", JSON.stringify(books))
  }, [books])

  useEffect(() => {
    localStorage.setItem("library_borrows", JSON.stringify(borrows))
  }, [borrows])

  useEffect(() => {
    localStorage.setItem("library_reservations", JSON.stringify(reservations))
  }, [reservations])

  const borrowBook = async (
    bookId: string,
    userId: string,
    duration: number,
  ): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const book = books.find((b) => b.id === bookId)
    if (!book) return { success: false, message: "Book not found" }
    if (book.availableCopies <= 0) return { success: false, message: "No copies available" }

    const existingBorrow = borrows.find((b) => b.bookId === bookId && b.userId === userId && b.status === "active")
    if (existingBorrow) return { success: false, message: "You already have this book borrowed" }

    const newBorrow: Borrow = {
      id: `borrow-${Date.now()}`,
      userId,
      bookId,
      startDate: new Date(),
      expectedReturnDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      isLate: false,
      status: "active",
    }

    setBorrows((prev) => [...prev, newBorrow])
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b)))

    return { success: true, message: `Successfully borrowed "${book.title}" for ${duration} days` }
  }

  const returnBook = async (borrowId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const borrow = borrows.find((b) => b.id === borrowId)
    if (!borrow) return { success: false, message: "Borrow record not found" }

    const book = books.find((b) => b.id === borrow.bookId)

    setBorrows((prev) =>
      prev.map((b) => (b.id === borrowId ? { ...b, status: "returned" as const, actualReturnDate: new Date() } : b)),
    )

    setBooks((prev) => prev.map((b) => (b.id === borrow.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b)))

    return { success: true, message: `Successfully returned "${book?.title}"` }
  }

  const reserveBook = async (
    bookId: string,
    userId: string,
    date: Date,
    duration: number,
  ): Promise<{ success: boolean; message: string; position?: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const book = books.find((b) => b.id === bookId)
    if (!book) return { success: false, message: "Book not found" }

    const existingReservation = reservations.find(
      (r) => r.bookId === bookId && r.userId === userId && r.status !== "cancelled",
    )
    if (existingReservation) return { success: false, message: "You already have a reservation for this book" }

    const bookReservations = reservations.filter((r) => r.bookId === bookId && r.status !== "cancelled")
    const position = bookReservations.length + 1

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      userId,
      bookId,
      requestedDate: new Date(),
      startDate: date,
      duration,
      status: "confirmed",
      position,
      totalReservations: position,
    }

    setReservations((prev) => [...prev, newReservation])

    return { success: true, message: `Reservation confirmed! You are #${position} in queue`, position }
  }

  const cancelReservation = async (reservationId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const reservation = reservations.find((r) => r.id === reservationId)
    if (!reservation) return { success: false, message: "Reservation not found" }

    setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status: "cancelled" as const } : r)))

    return { success: true, message: "Reservation cancelled successfully" }
  }

  const renewBorrow = async (borrowId: string, extraDays: number): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const borrow = borrows.find((b) => b.id === borrowId)
    if (!borrow) return { success: false, message: "Borrow record not found" }
    if (borrow.status !== "active") return { success: false, message: "This borrow is not active" }

    const newReturnDate = new Date(borrow.expectedReturnDate)
    newReturnDate.setDate(newReturnDate.getDate() + extraDays)

    setBorrows((prev) => prev.map((b) => (b.id === borrowId ? { ...b, expectedReturnDate: newReturnDate } : b)))

    return {
      success: true,
      message: `Extended by ${extraDays} days. New return date: ${newReturnDate.toLocaleDateString()}`,
    }
  }

  const getUserBorrows = (userId: string) => borrows.filter((b) => b.userId === userId)
  const getUserReservations = (userId: string) => reservations.filter((r) => r.userId === userId)
  const getBookById = (bookId: string) => books.find((b) => b.id === bookId)

  const addBook = async (bookData: Omit<Book, "id">): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
    }

    setBooks((prev) => [...prev, newBook])
    return { success: true, message: `"${newBook.title}" added to catalog` }
  }

  const updateBook = async (bookId: string, updates: Partial<Book>): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const book = books.find((b) => b.id === bookId)
    if (!book) return { success: false, message: "Book not found" }

    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b)))

    return { success: true, message: `"${book.title}" updated successfully` }
  }

  const deleteBook = async (bookId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const book = books.find((b) => b.id === bookId)
    if (!book) return { success: false, message: "Book not found" }

    const hasActiveBorrows = borrows.some((b) => b.bookId === bookId && b.status === "active")
    if (hasActiveBorrows) return { success: false, message: "Cannot delete book with active borrows" }

    setBooks((prev) => prev.filter((b) => b.id !== bookId))
    return { success: true, message: `"${book.title}" removed from catalog` }
  }

  return (
    <LibraryContext.Provider
      value={{
        books,
        borrows,
        reservations,
        borrowBook,
        returnBook,
        reserveBook,
        cancelReservation,
        renewBorrow,
        getUserBorrows,
        getUserReservations,
        getBookById,
        addBook,
        updateBook,
        deleteBook,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider")
  }
  return context
}
