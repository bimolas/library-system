"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import Link from "next/link";
import { useNotification } from "@/lib/notification-context";
import { useConfirmation } from "@/components/confirmation-modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  addBookCopies,
  createBook,
  deleteBook,
  deleteBookCopies,
  fetchBooks,
  updateBook,
} from "@/services/book.service";

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("catalog");
  const { showNotification } = useNotification();
  const { confirm } = useConfirmation();
  const [books, setBooks] = useState([] as any[]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const BASE_URL = "http://localhost:3000";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const booksData = await fetchBooks();

        if (!mounted) return;
        if (booksData) setBooks(booksData);
      } catch (e: any) {
        console.error("Failed to load books data:", e);
        if (mounted) setError(e?.message || "Failed to load books data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
    setCoverFile(f);
    if (f) {
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  const openEditModal = (book: any) => {
    setEditingBook({ ...book });
    setEditCoverFile(null);
    if (book.coverImage) {
      setEditCoverPreview(book.coverImage);
    } else {
      setEditCoverPreview(null);
    }
    setShowEditModal(true);
  };
  const handleEditCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (editCoverPreview && editCoverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(editCoverPreview);
    }
    setEditCoverFile(f);
    if (f) {
      setEditCoverPreview(URL.createObjectURL(f));
    }
  };
  const handleUpdateBook = async () => {
    if (!editingBook) return;
    setLoading(true);
    try {
      const book = {
        id: editingBook.id,
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn,
        genre: editingBook.genre,
        description: editingBook.description,
        totalCopies: Number.parseInt(editingBook.totalCopies),
        availableCopies: Number.parseInt(editingBook.totalCopies),
        language: editingBook.language,
        pages: editingBook.pages ? Number.parseInt(editingBook.pages) : 100,
      };
      await updateBook(editingBook.id, book, editCoverFile || undefined);
      await refreshBooks();
      showNotification("success", `"${editingBook.title}" updated.`);
      setShowEditModal(false);
      setEditingBook(null);
      if (editCoverPreview && editCoverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(editCoverPreview);
      }
      setEditCoverFile(null);
      setEditCoverPreview(null);
      setEditCoverFile(null);
      setEditCoverPreview(null);
    } catch (e: any) {
      console.error("Update book failed:", e);
      showNotification("error", e?.message || "Failed to update book.");
    } finally {
      setLoading(false);
    }
  };

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    totalCopies: "5",
    description: "",
    language: "",
    pages: "",
    genres: "",
  });

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate inventory recommendations
  const inventoryAnalysis = books.map((book) => {
    const borrowRate = book.monthlyBorrows / book.totalCopies;
    let recommendation: "increase" | "maintain" | "decrease" | "remove" =
      "maintain";
    let reason = "";

    if (borrowRate > 5 && book.availableCopies === 0) {
      recommendation = "increase";
      reason = "High demand, no availability";
    } else if (borrowRate > 3) {
      recommendation = "increase";
      reason = "High borrow frequency";
    } else if (borrowRate < 0.5 && book.totalCopies > 3) {
      recommendation = "decrease";
      reason = "Low demand, excess copies";
    } else if (borrowRate < 0.2 && book.borrowCount < 5) {
      recommendation = "remove";
      reason = "Very low interest";
    }

    return { ...book, borrowRate, recommendation, reason };
  });

  const needsIncrease = inventoryAnalysis.filter(
    (b) => b.recommendation === "increase"
  );
  const needsDecrease = inventoryAnalysis.filter(
    (b) => b.recommendation === "decrease" || b.recommendation === "remove"
  );

  const popularityData = books
    .sort((a, b) => b.monthlyBorrows - a.monthlyBorrows)
    .slice(0, 8)
    .map((book) => ({
      name:
        book.title.length > 15
          ? book.title.substring(0, 15) + "..."
          : book.title,
      borrows: book.monthlyBorrows,
      copies: book.totalCopies,
    }));

  const handleDelete = async (bookId: string, bookTitle: string) => {
    const confirmed = await confirm({
      title: "Delete Book",
      message: `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      try {
        await deleteBook(bookId);
        await refreshBooks();
        showNotification(
          "success",
          `"${bookTitle}" has been deleted from the library.`
        );
      } catch (error) {
        showNotification(
          "error",
          "Failed to delete the book. Please try again."
        );
      }
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      showNotification("error", "Please fill in all required fields.");
      return;
    }

    const book = {
      id: `book-${Date.now()}`,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      genre: newBook.genres,
      description: newBook.description,
      totalCopies: Number.parseInt(newBook.totalCopies),
      availableCopies: Number.parseInt(newBook.totalCopies),
      language: newBook.language,
      pages: newBook.pages ? Number.parseInt(newBook.pages) : 100,
      rating: 0,
      borrowCount: 0,
    };

    try {
      await createBook(book, coverFile);
      await refreshBooks();
      showNotification(
        "success",
        `"${newBook.title}" has been added to the library.`
      );
      setShowAddModal(false);
      setNewBook({
        title: "",
        author: "",
        isbn: "",
        totalCopies: "5",
        description: "",
        genres: "",
        language: "",
        pages: "",
      });
    } catch (error) {
      showNotification("error", "Failed to add the book. Please try again.");
    }
  };

  const refreshBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedBooks = await fetchBooks();
      setBooks(updatedBooks);
    } catch (error) {
      showNotification("error", "Failed to refresh books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCopies = async (bookId: string, change: number) => {
    try {
      const book = books.find((b) => b.id === bookId);
      if (!book) return;

      const newTotal = book.totalCopies + change;
      if (newTotal < 1) {
        showNotification("error", "Cannot reduce copies below 1.");
        return;
      }
      if (newTotal < book.totalCopies) {
        await deleteBookCopies(bookId, book.totalCopies - newTotal);
      } else {
        await addBookCopies(bookId, newTotal - book.totalCopies);
      }

      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                totalCopies: newTotal,
                availableCopies: Math.min(b.availableCopies + change, newTotal),
              }
            : b
        )
      );
      showNotification(
        "success",
        `Updated "${book.title}" to ${newTotal} copies.`
      );
    } catch (error) {
      showNotification("error", "Failed to update copies. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background page-container">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book Management</h1>
            <p className="text-muted-foreground">
              Manage your library inventory and book catalog
            </p>
          </div>
          <Button
            className="gap-2 hover-lift"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fadeIn"
        >
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
              <div className="overflow-hidden">
                <div className="max-h-[60vh] sm:max-h-[60vh] overflow-y-auto">
                  <div className="min-w-full overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left py-4 px-4 font-semibold">
                            Book
                          </th>
                          <th className="text-center py-4 px-4 font-semibold">
                            ISBN
                          </th>
                          <th className="text-center py-4 px-4 font-semibold">
                            Copies
                          </th>
                          <th className="text-center py-4 px-4 font-semibold">
                            Available
                          </th>
                          <th className="text-center py-4 px-4 font-semibold">
                            Monthly
                          </th>
                          <th className="text-center py-4 px-4 font-semibold">
                            Demand
                          </th>
                          <th className="text-center py-4 px-4 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Loading books...
                            </td>
                          </tr>
                        )}
                        {error && (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-8 text-destructive"
                            >
                              Error loading books.
                            </td>
                          </tr>
                        )}
                        {filteredBooks.map((book, index) => (
                          <tr
                            key={book.id}
                            className="border-b border-border hover:bg-muted/30 transition-smooth animate-fadeIn"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded overflow-hidden flex-shrink-0 border border-border">
                                  {book.coverImage?.startsWith(BASE_URL) ? (
                                    <img
                                      src={book.coverImage}
                                      alt={`${book.title} cover`}
                                      className="w-full h-full object-cover block"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-primary" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">{book.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {book.author}
                                  </p>
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
                                  onClick={() =>
                                    handleUpdateCopies(book.id, -1)
                                  }
                                >
                                  -
                                </Button>
                                <span className="font-semibold w-8">
                                  {book.totalCopies}
                                </span>
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
                              <span className="font-semibold">
                                {book.borrowCount}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <Badge
                                className={
                                  book.borrowCount > 10
                                    ? "bg-red-500/10 text-red-600 border-red-500/30"
                                    : book.borrowCount > 5
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                }
                              >
                                {book.borrowCount > 10
                                  ? "High"
                                  : book.borrowCount > 5
                                  ? "Medium"
                                  : "Low"}
                              </Badge>
                            </td>
                            <td className="text-center py-4 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <Link href={`/catalog/${book.id}`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover-lift"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover-lift"
                                  onClick={() => openEditModal(book)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover-lift"
                                  onClick={() =>
                                    handleDelete(book.id, book.title)
                                  }
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
                </div>
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
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#888"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="borrows"
                      name="Monthly Borrows"
                      fill="#8b5a2b"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="copies"
                      name="Total Copies"
                      fill="#deb887"
                      radius={[0, 4, 4, 0]}
                    />
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
                    <p className="text-sm text-muted-foreground">
                      Total Titles
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {books.reduce((sum, b) => sum + b.totalCopies, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Copies
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {books.reduce((sum, b) => sum + b.availableCopies, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available Now
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {books.reduce((sum, b) => sum + b.borrowCount, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Monthly Borrows
                    </p>
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
                          <p className="text-xs text-muted-foreground">
                            {book.author}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {book.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-semibold">
                            {book.monthlyBorrows}
                          </span>{" "}
                          borrows/month
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.totalCopies} copies, {book.availableCopies}{" "}
                          available
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 hover-lift"
                          onClick={() => handleUpdateCopies(book.id, 2)}
                        >
                          Add 2 Copies
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  All books have adequate inventory levels.
                </p>
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
                          <p className="text-xs text-muted-foreground">
                            {book.author}
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            {book.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-semibold">
                            {book.monthlyBorrows}
                          </span>{" "}
                          borrows/month
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.totalCopies} copies, {book.availableCopies}{" "}
                          available
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
                <p className="text-muted-foreground text-center py-8">
                  No books with excess inventory detected.
                </p>
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
                    <label className="text-sm font-medium mb-2 block">
                      Title *
                    </label>
                    <Input
                      placeholder="Enter book title"
                      value={newBook.title}
                      onChange={(e) =>
                        setNewBook((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Author *
                    </label>
                    <Input
                      placeholder="Enter author name"
                      value={newBook.author}
                      onChange={(e) =>
                        setNewBook((prev) => ({
                          ...prev,
                          author: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        ISBN *
                      </label>
                      <Input
                        placeholder="978-0-123456-78-9"
                        value={newBook.isbn}
                        onChange={(e) =>
                          setNewBook((prev) => ({
                            ...prev,
                            isbn: e.target.value,
                          }))
                        }
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Total Copies
                      </label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={newBook.totalCopies}
                        onChange={(e) =>
                          setNewBook((prev) => ({
                            ...prev,
                            totalCopies: e.target.value,
                          }))
                        }
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Description
                    </label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-background focus:border-primary transition-smooth resize-none"
                      placeholder="Enter book description..."
                      value={newBook.description}
                      onChange={(e) =>
                        setNewBook((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Genres (comma separated)
                    </label>
                    <Input
                      placeholder="Fiction, Mystery, Thriller"
                      value={newBook.genres}
                      onChange={(e) =>
                        setNewBook((prev) => ({
                          ...prev,
                          genres: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Language
                      </label>
                      <select
                        value={newBook.language}
                        onChange={(e) =>
                          setNewBook((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary transition-smooth"
                      >
                        <option value="">Select language</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Total Pages
                      </label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newBook.pages}
                        onChange={(e) =>
                          setNewBook((prev) => ({
                            ...prev,
                            pages: e.target.value,
                          }))
                        }
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  {/* Cover upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="w-24 h-32 bg-muted/20 rounded overflow-hidden flex items-center justify-center border border-border cursor-pointer">
                        {coverPreview ? (
                          // preview
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground px-2 text-center">
                            Click to upload
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-2">
                          Recommended size: 600x900px. PNG or JPG.
                        </p>
                        {coverFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {coverFile.name}
                          </p>
                        )}
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (coverPreview) {
                                URL.revokeObjectURL(coverPreview);
                                setCoverPreview(null);
                              }
                              setCoverFile(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 hover-lift"
                      onClick={handleAddBook}
                    >
                      Add Book
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
      {showEditModal && editingBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <Card className="w-full max-w-2xl border-border shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Edit className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Update Book</h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title *
                  </label>
                  <Input
                    placeholder="Enter book title"
                    value={editingBook.title}
                    onChange={(e) =>
                      setEditingBook((prev: any) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Author *
                  </label>
                  <Input
                    placeholder="Enter author name"
                    value={editingBook.author}
                    onChange={(e) =>
                      setEditingBook((prev: any) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    className="bg-background border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      ISBN *
                    </label>
                    <Input
                      placeholder="978-0-123456-78-9"
                      value={editingBook.isbn}
                      onChange={(e) =>
                        setEditingBook((prev: any) => ({
                          ...prev,
                          isbn: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Total Copies
                    </label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={String(editingBook.totalCopies ?? "")}
                      onChange={(e) =>
                        setEditingBook((prev: any) => ({
                          ...prev,
                          totalCopies: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-background focus:border-primary transition-smooth resize-none"
                    placeholder="Enter book description..."
                    value={editingBook.description ?? ""}
                    onChange={(e) =>
                      setEditingBook((prev: any) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Genres (comma separated)
                  </label>
                  <Input
                    placeholder="Fiction, Mystery, Thriller"
                    value={editingBook.genre ?? ""}
                    onChange={(e) =>
                      setEditingBook((prev: any) => ({
                        ...prev,
                        genres: e.target.value,
                      }))
                    }
                    className="bg-background border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Language
                    </label>
                    <select
                      value={editingBook.language || ""}
                      onChange={(e) =>
                        setEditingBook((prev: any) => ({
                          ...prev,
                          language: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary transition-smooth"
                    >
                      <option value="">Select language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Total Pages
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={String(editingBook.pages ?? "")}
                      onChange={(e) =>
                        setEditingBook((prev: any) => ({
                          ...prev,
                          pages: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                {/* Cover upload (optional replace) */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cover Image (replace)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="w-24 h-32 bg-muted/20 rounded overflow-hidden flex items-center justify-center border border-border cursor-pointer">
                      {editCoverPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editCoverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground px-2 text-center">
                          Click to upload
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditCoverChange}
                        className="hidden"
                      />
                    </label>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">
                        Recommended size: 600x900px. PNG or JPG.
                      </p>
                      {editCoverFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {editCoverFile.name}
                        </p>
                      )}
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              editCoverPreview &&
                              editCoverPreview.startsWith("blob:")
                            ) {
                              URL.revokeObjectURL(editCoverPreview);
                            }
                            setEditCoverPreview(null);
                            setEditCoverFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 hover-lift"
                    onClick={handleUpdateBook}
                    disabled={loading}
                  >
                    {loading ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
