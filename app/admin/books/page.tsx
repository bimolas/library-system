"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Package,
  BarChart3,
  X,
  CheckCircle,
} from "lucide-react"
import { mockBooks } from "@/lib/mock-data"
import Link from "next/link"
import { useNotification } from "@/lib/notification-context"
import { useConfirmation } from "@/components/confirmation-modal"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState("catalog")
  const { showNotification } = useNotification()
  const { confirm } = useConfirmation()

  const [books, setBooks] = useState(
    mockBooks.map((book) => ({
      ...book,
      borrowCount: Math.floor(Math.random() * 100) + 10,
      monthlyBorrows: Math.floor(Math.random() * 30) + 5,
    })),
  )

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    totalCopies: "5",
    description: "",
    genres: "",
  })

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate inventory recommendations
  const inventoryAnalysis = books.map((book) => {
    const borrowRate = book.monthlyBorrows / book.totalCopies
    let recommendation: "increase" | "maintain" | "decrease" | "remove" = "maintain"
    let reason = ""

    if (borrowRate > 5 && book.availableCopies === 0) {
      recommendation = "increase"
      reason = "High demand, no availability"
    } else if (borrowRate > 3) {
      recommendation = "increase"
      reason = "High borrow frequency"
    } else if (borrowRate < 0.5 && book.totalCopies > 3) {
      recommendation = "decrease"
      reason = "Low demand, excess copies"
    } else if (borrowRate < 0.2 && book.borrowCount < 5) {
      recommendation = "remove"
      reason = "Very low interest"
    }

    return { ...book, borrowRate, recommendation, reason }
  })

  const needsIncrease = inventoryAnalysis.filter((b) => b.recommendation === "increase")
  const needsDecrease = inventoryAnalysis.filter(
    (b) => b.recommendation === "decrease" || b.recommendation === "remove",
  )

  const popularityData = books
    .sort((a, b) => b.monthlyBorrows - a.monthlyBorrows)
    .slice(0, 8)
    .map((book) => ({
      name: book.title.length > 15 ? book.title.substring(0, 15) + "..." : book.title,
      borrows: book.monthlyBorrows,
      copies: book.totalCopies,
    }))

  const handleDelete = async (bookId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Delete Book",
      message: `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    })

    if (confirmed) {
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
      showNotification(`"${bookTitle}" has been deleted from the library.`, "success")
    }
  }

  const handleAddBook = () => {
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      showNotification("Please fill in all required fields.", "error")
      return
    }

    const book = {
      id: `book-${Date.now()}`,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      genre: newBook.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      description: newBook.description,
      coverImage: "/abstract-book-cover.png",
      totalCopies: Number.parseInt(newBook.totalCopies),
      availableCopies: Number.parseInt(newBook.totalCopies),
      rating: 0,
      reviewCount: 0,
      popularity: 0,
      demandPressure: "low" as const,
      borrowCount: 0,
      monthlyBorrows: 0,
    }

    setBooks((prev) => [...prev, book])
    showNotification(`"${newBook.title}" has been added to the library.`, "success")
    setShowAddModal(false)
    setNewBook({ title: "", author: "", isbn: "", totalCopies: "5", description: "", genres: "" })
  }

  const handleUpdateCopies = async (bookId: string, change: number) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return

    const newTotal = book.totalCopies + change
    if (newTotal < 1) {
      showNotification("Cannot reduce copies below 1.", "error")
      return
    }

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, totalCopies: newTotal, availableCopies: Math.min(b.availableCopies + change, newTotal) }
          : b,
      ),
    )
    showNotification(`Updated "${book.title}" to ${newTotal} copies.`, "success")
  }

  return (
    <div className="min-h-screen bg-background page-container">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book Management</h1>
            <p className="text-muted-foreground">Manage your library inventory and book catalog</p>
          </div>
          <Button className="gap-2 hover-lift" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add New Book
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fadeIn">
          <TabsList className="bg-muted/50 mb-6">
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            {/* Search */}
            <Card className="p-4 border-border mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border focus:border-primary transition-smooth"
                />
              </div>
            </Card>

            {/* Books Table */}
            <Card className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-4 px-4 font-semibold">Book</th>
                      <th className="text-center py-4 px-4 font-semibold">ISBN</th>
                      <th className="text-center py-4 px-4 font-semibold">Copies</th>
                      <th className="text-center py-4 px-4 font-semibold">Available</th>
                      <th className="text-center py-4 px-4 font-semibold">Monthly</th>
                      <th className="text-center py-4 px-4 font-semibold">Demand</th>
                      <th className="text-center py-4 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book, index) => (
                      <tr
                        key={book.id}
                        className="border-b border-border hover:bg-muted/30 transition-smooth animate-fadeIn"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{book.title}</p>
                              <p className="text-xs text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <p className="font-mono text-xs">{book.isbn}</p>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleUpdateCopies(book.id, -1)}
                            >
                              -
                            </Button>
                            <span className="font-semibold w-8">{book.totalCopies}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleUpdateCopies(book.id, 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge
                            className={
                              book.availableCopies > 0
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                            }
                          >
                            {book.availableCopies}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4">
                          <span className="font-semibold">{book.monthlyBorrows}</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge
                            className={
                              book.demandPressure === "high"
                                ? "bg-red-500/10 text-red-600 border-red-500/30"
                                : book.demandPressure === "medium"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            }
                          >
                            {book.demandPressure}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/catalog/${book.id}`}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover-lift">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover-lift">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover-lift"
                              onClick={() => handleDelete(book.id, book.title)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            {/* Popularity Chart */}
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Monthly Borrow Frequency vs Copies Available
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis type="number" stroke="#888" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="borrows" name="Monthly Borrows" fill="#8b5a2b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="copies" name="Total Copies" fill="#deb887" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{books.length}</p>
                    <p className="text-sm text-muted-foreground">Total Titles</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{books.reduce((sum, b) => sum + b.totalCopies, 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Copies</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{books.reduce((sum, b) => sum + b.availableCopies, 0)}</p>
                    <p className="text-sm text-muted-foreground">Available Now</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{books.reduce((sum, b) => sum + b.monthlyBorrows, 0)}</p>
                    <p className="text-sm text-muted-foreground">Monthly Borrows</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {/* Need More Copies */}
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                Books Needing More Copies ({needsIncrease.length})
              </h3>
              {needsIncrease.length > 0 ? (
                <div className="space-y-3">
                  {needsIncrease.map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-fadeIn"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                          <p className="text-xs text-emerald-600 mt-1">{book.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-semibold">{book.monthlyBorrows}</span> borrows/month
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.totalCopies} copies, {book.availableCopies} available
                        </p>
                        <Button size="sm" className="mt-2 hover-lift" onClick={() => handleUpdateCopies(book.id, 2)}>
                          Add 2 Copies
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">All books have adequate inventory levels.</p>
              )}
            </Card>

            {/* Consider Reducing */}
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-600">
                <TrendingDown className="w-4 h-4" />
                Consider Reducing Stock ({needsDecrease.length})
              </h3>
              {needsDecrease.length > 0 ? (
                <div className="space-y-3">
                  {needsDecrease.map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg animate-fadeIn"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                          <p className="text-xs text-amber-600 mt-1">{book.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-semibold">{book.monthlyBorrows}</span> borrows/month
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.totalCopies} copies, {book.availableCopies} available
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent hover-lift"
                            onClick={() => handleUpdateCopies(book.id, -1)}
                          >
                            Remove 1
                          </Button>
                          {book.recommendation === "remove" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="hover-lift"
                              onClick={() => handleDelete(book.id, book.title)}
                            >
                              Remove All
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No books with excess inventory detected.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Book Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <Card className="w-full max-w-2xl border-border shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Add New Book</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title *</label>
                    <Input
                      placeholder="Enter book title"
                      value={newBook.title}
                      onChange={(e) => setNewBook((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Author *</label>
                    <Input
                      placeholder="Enter author name"
                      value={newBook.author}
                      onChange={(e) => setNewBook((prev) => ({ ...prev, author: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">ISBN *</label>
                      <Input
                        placeholder="978-0-123456-78-9"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook((prev) => ({ ...prev, isbn: e.target.value }))}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Total Copies</label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={newBook.totalCopies}
                        onChange={(e) => setNewBook((prev) => ({ ...prev, totalCopies: e.target.value }))}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-background focus:border-primary transition-smooth resize-none"
                      placeholder="Enter book description..."
                      value={newBook.description}
                      onChange={(e) => setNewBook((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Genres (comma separated)</label>
                    <Input
                      placeholder="Fiction, Mystery, Thriller"
                      value={newBook.genres}
                      onChange={(e) => setNewBook((prev) => ({ ...prev, genres: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button className="flex-1 hover-lift" onClick={handleAddBook}>
                      Add Book
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
