export type UserRole = "student" | "admin"
export type BookStatus = "available" | "borrowed" | "reserved"
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "fulfilled"
export type UserStatus = "active" | "warning" | "suspended" | "banned"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  score: number
  level: "bronze" | "silver" | "gold" | "platinum"
  borrowingLimit: number
  activeBorrows: number
  joinedDate: Date
  profileImage?: string
  status: UserStatus
  customBorrowDays?: number
  totalBorrows: number
  onTimeRate: number
  penalties: number
  bonuses: number
  banExpiry?: Date
  banReason?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  favoriteGenres: string[]
  emailNotifications: boolean
  borrowReminders: boolean
  reservationAlerts: boolean
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  genre: string[]
  description: string
  coverImage: string
  totalCopies: number
  availableCopies: number
  rating: number
  reviewCount: number
  popularity: number
  demandPressure: "low" | "medium" | "high"
  nextAvailableDate?: Date
  publisher?: string
  publishedYear?: number
  pages?: number
  language?: string
  borrowCount: number
  monthlyBorrows: number
  lastBorrowed?: Date
}

export interface Borrow {
  id: string
  userId: string
  bookId: string
  startDate: Date
  expectedReturnDate: Date
  actualReturnDate?: Date
  isLate: boolean
  status: "active" | "returned" | "overdue"
}

export interface Reservation {
  id: string
  userId: string
  bookId: string
  requestedDate: Date
  startDate: Date
  duration: number
  status: ReservationStatus
  position: number
  totalReservations: number
}

export interface Review {
  id: string
  userId: string
  bookId: string
  rating: number
  comment: string
  createdDate: Date
  completionStatus: "reading" | "completed" | "abandoned"
}

export interface UserAnalytics {
  totalBooksRead: number
  genresExplored: string[]
  onTimeReturnRate: number
  averageRating: number
  readingStreak: number
  scoreHistory: { date: Date; score: number }[]
}
