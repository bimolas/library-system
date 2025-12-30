"use client";

import { useState, useMemo, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, Filter, BookOpen, TrendingUp, Star } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import type { Book } from "@/lib/types";
import Link from "next/link";
import { fetchBooks } from "@/services/book.service";
interface FilterState {
  search: string;
  genres: string[];
  availability: "all" | "available" | "reserved";
  demandLevel: "all" | "low" | "medium" | "high";
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    genres: [],
    availability: "all",
    demandLevel: "all",
  });

  const [sortBy, setSortBy] = useState<
    "popularity" | "rating" | "newest" | "demand"
  >("popularity");
  const [showFilters, setShowFilters] = useState(false);
  const [books, setBooks] = useState<Book[]>([]); // start with mock data
  // const [books, setBooks] = useState<Book[]>(mockBooks); // start with mock data

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allGenres = Array.from(new Set(books.flatMap((b) => b.genre))).sort();
  const demandeLevelValues: any = {
    low: 1,
    medium: 5,
    high: 10,
  };
  const filteredBooks = useMemo(() => {
    let results = [...books];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.author.toLowerCase().includes(searchLower) ||
          b.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.genres.length > 0) {
      results = results.filter((b) =>
        filters?.genres?.some((g) => b.genre.includes(g))
      );
    }

    if (filters.availability === "available") {
      results = results.filter((b) => b.availableCopies > 0);
    } else if (filters.availability === "reserved") {
      results = results.filter((b) => b.availableCopies === 0);
    }

    if (filters.demandLevel !== "all") {
      results = results.filter((b) => b.borrowCount <= demandeLevelValues[filters.demandLevel]);
    }
    // Sorting
    switch (sortBy) {
      case "popularity":
        results.sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0));
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "demand":
        results.sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0));
        break;
      case "newest":
        results.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt, 0, 1) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt, 0, 1) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      default:
        break;
    }

    return results;
  }, [filters, sortBy, books]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBooks(filters.search);
        if (mounted && Array.isArray(data)) setBooks(data as any);
      } catch (err: any) {
        console.error("Failed to load books:", err);
        if (mounted)
          setError(err?.message || "Failed to load books — using local data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [filters.search]);

  const toggleGenre = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.genres.length +
    (filters.availability !== "all" ? 1 : 0) +
    (filters.demandLevel !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Book Catalog</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Loading books..."
              : error
              ? `${books.length} books (error: ${error})`
              : `Browse ${books.length} books in our collection`}
          </p>
        </div>

        {/* Search & Controls */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or description..."
              className="pl-10"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 bg-transparent"
            size="lg"
          >
            <Filter className="w-4 h-4" />
            Filters{" "}
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        {/* Sort */}
        <div className="mb-6 flex gap-2">
          <span className="text-sm text-muted-foreground self-center">
            Sort by:
          </span>
          {(["popularity", "rating", "demand", "newest"] as const).map(
            (sort) => (
              <Button
                key={sort}
                size="sm"
                variant={sortBy === sort ? "default" : "outline"}
                className={sortBy === sort ? "" : "bg-transparent"}
                onClick={() => setSortBy(sort)}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Button>
            )
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-6 border-border animate-slideIn">
            <div className="space-y-6">
              {/* Availability Filter */}
              <div>
                <h3 className="font-semibold mb-3">Availability</h3>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "available", "reserved"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={
                        filters.availability === status ? "default" : "outline"
                      }
                      className={
                        filters.availability === status ? "" : "bg-transparent"
                      }
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          availability: status,
                        }))
                      }
                    >
                      {status === "all"
                        ? "All Copies"
                        : status === "available"
                        ? "In Stock"
                        : "Reserved"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Demand Filter */}
              <div>
                <h3 className="font-semibold mb-3">Demand Level</h3>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "low", "medium", "high"] as const).map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={
                        filters.demandLevel === level ? "default" : "outline"
                      }
                      className={
                        filters.demandLevel === level ? "" : "bg-transparent"
                      }
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, demandLevel: level }))
                      }
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <h3 className="font-semibold mb-3">Genres</h3>
                <div className="flex gap-2 flex-wrap">
                  {allGenres.map((genre) => (
                    <Button
                      key={genre}
                      size="sm"
                      variant={
                        filters.genres.includes(genre) ? "default" : "outline"
                      }
                      className={
                        filters.genres.includes(genre) ? "" : "bg-transparent"
                      }
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() =>
                  setFilters({
                    search: "",
                    genres: [],
                    availability: "all",
                    demandLevel: "all",
                  })
                }
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book, index) => (
              <BookCard key={book.id} book={book} delay={index * 50} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {loading ? "Loading books..." : "No books match your filters"}
              </p>

              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    genres: [],
                    availability: "all",
                    demandLevel: "all",
                  })
                }
                className="bg-transparent"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BookCard({ book, delay }: { book: Book; delay: number }) {
  const availabilityStatus =
    book.availableCopies > 0 ? "available" : "reserved";
  const availabilityColor =
    book.availableCopies > 0
      ? "bg-success/10 text-success border-success/30"
      : "bg-amber-500/10 text-amber-600 border-amber-500/30";

  return (
    <Card
      className="overflow-hidden border-border hover:border-primary transition-smooth group cursor-pointer animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link href={`/catalog/${book.id}`} className="block">
        <div className="relative h-56 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
          <BookOpen className="w-16 h-16 text-primary opacity-40 group-hover:scale-110 transition-smooth" />
          <Badge className={`absolute top-2 right-2 ${availabilityColor}`}>
            {availabilityStatus === "available"
              ? `${book.availableCopies} available`
              : "Reserved"}
          </Badge>
          {book.borrowCount > 10 && (
            <Badge className="absolute top-2 left-2 bg-destructive/10 text-destructive border-destructive/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              High Demand
            </Badge>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-smooth">
            {book.title.slice(0, 30) + (book.title.length > 30 ? "..." : "")}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.author}
          </p>

          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge key={book.genre} variant="secondary" className="text-xs">
              {book.genre}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(book.rating)
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {book.rating.toString().slice(0, 3)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({book.reviewCount || 0} reviews)
              </span>
            </div>
            <Button size="sm" className="text-xs hover-lift">
              View
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}
