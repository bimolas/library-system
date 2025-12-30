"use client";

import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  BookOpen,
  TrendingUp,
  Users,
  Heart,
  Zap,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getMyRecommendedBooks,
  getTrendingBooks,
} from "@/services/book.service";

export default function RecommendationsPage() {
  const [savedBooks, setSavedBooks] = useState<Set<number>>(new Set());

  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const booksData = await getMyRecommendedBooks();
        const trendingBooks = await getTrendingBooks();

        if (!mounted) return;
        if (booksData && booksData.length > 0) {
          setRecommendedBooks(booksData);
        }
        if (trendingBooks && trendingBooks.length > 0) {
          setTrendingBooks(trendingBooks);
        }
      } catch (e: any) {
        console.error("Failed to load dashboard data:", e);
        if (mounted) setError(e?.message || "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleSave = (bookId: number) => {
    setSavedBooks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const personalized = [
    {
      id: 1,
      title: "Educated",
      author: "Tara Westover",
      reason: "You loved Non-Fiction books",
      rating: 4.8,
      genre: "Memoir",
      match: 94,
    },
    {
      id: 2,
      title: "Dune",
      author: "Frank Herbert",
      reason: "Readers like you also borrowed this",
      rating: 4.7,
      genre: "Science Fiction",
      match: 87,
    },
    {
      id: 3,
      title: "The Power of Habit",
      author: "Charles Duhigg",
      reason: "Similar to Atomic Habits which you rated 5★",
      rating: 4.6,
      genre: "Psychology",
      match: 92,
    },
  ];

  const trending = [
    {
      id: 4,
      title: "Fourth Wing",
      author: "Rebecca Yarros",
      trending: "↑ 45% this month",
      rating: 4.7,
      genre: "Fantasy",
      demand: "High",
    },
    {
      id: 5,
      title: "Lessons in Chemistry",
      author: "Bonnie Garmus",
      trending: "↑ 38% this month",
      rating: 4.8,
      genre: "Historical Fiction",
      demand: "High",
    },
    {
      id: 6,
      title: "Remarkably Bright",
      author: "Katherine Center",
      trending: "↑ 32% this month",
      rating: 4.6,
      genre: "Contemporary",
      demand: "Medium",
    },
  ];

  const communityPicks = [
    {
      id: 7,
      title: "The Thursday Murder Club",
      author: "Richard Osman",
      rating: 4.9,
      community: "⭐ Community Favorite",
      badge: "Gold Members",
    },
    {
      id: 8,
      title: "Verity",
      author: "Colleen Hoover",
      rating: 4.8,
      community: "↑ Rising Star",
      badge: "Last 3 Months",
    },
    {
      id: 9,
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      rating: 4.9,
      community: "🎯 Highest Rated",
      badge: "All Time",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Smart Recommendations</h1>
          <p className="text-muted-foreground">
            Personalized suggestions powered by your reading score and community
            insights
          </p>
        </div>

        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 bg-muted/30">
            <TabsTrigger value="personalized" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">For You</span>
              <span className="sm:hidden">You</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Trend</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
              <span className="sm:hidden">Comm.</span>
            </TabsTrigger>
          </TabsList>

          {/* Personalized Tab */}
          <TabsContent
            value="personalized"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            <Card className="p-4 mb-4 bg-primary/5 border-primary/30 flex items-start gap-4">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Gold Member Advantage</p>
                <p className="text-muted-foreground">
                  As a Gold member, you get early access to new arrivals and
                  exclusive recommendations based on your preferences.
                </p>
              </div>
            </Card>

            {recommendedBooks.map((book, index) => (
              <Card
                key={book.id}
                className="p-6 border-border hover:border-primary transition-smooth group animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4 mb-4">
                  <Link href="/catalog/1">
                    <div className="w-20 h-28 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                      <BookOpen className="w-8 h-8 text-primary opacity-40" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href="/catalog/1">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-smooth cursor-pointer">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3">
                      {book.author}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
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
                          {book.rating}
                        </span>
                      </div>
                      <Badge variant="secondary">{book.genre}</Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/30">
                        <Zap className="w-3 h-3 mr-1" />
                        {book.match || 0}% match
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      {book.reason || "Similar books you've enjoyed"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/catalog/${book.id}`} className="flex-1">
                    <Button size="sm" className="w-full hover-lift">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-2 ${
                      savedBooks.has(book.id)
                        ? "bg-accent/10 text-accent"
                        : "bg-transparent"
                    }`}
                    onClick={() => toggleSave(book.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        savedBooks.has(book.id) ? "fill-accent" : ""
                      }`}
                    />
                    {savedBooks.has(book.id) ? "Saved" : "Save"}
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent
            value="trending"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            <Card className="p-4 mb-4 bg-accent/5 border-accent/30 flex items-start gap-4">
              <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">What's Popular</p>
                <p className="text-muted-foreground">
                  These books are trending this month among all readers. Higher
                  demand = higher priority in queue.
                </p>
              </div>
            </Card>

            {trendingBooks.map((book, index) => (
              <Card
                key={book.id}
                className="p-6 border-border hover:border-primary transition-smooth group animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4 mb-4">
                  <Link href="/catalog/1">
                    <div className="w-20 h-28 bg-gradient-to-br from-accent/20 to-primary/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                      <TrendingUp className="w-8 h-8 text-accent opacity-40" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Link href="/catalog/1">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-smooth cursor-pointer">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <Badge className="bg-destructive/10 text-destructive">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {book.borrowCount
                          ? `↑ ${Math.min(
                              100,
                              Math.round((book.borrowCount / 20) * 100)
                            )}%`
                          : "N/A"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mt-3">
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
                      <Badge variant="secondary">{book.genre}</Badge>
                      <Badge
                        className={
                          book.borrowCount >= 10
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {book.borrowCount >= 10 ? "High" : "Medium"} Demand
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/catalog/${book.id}`} className="flex-1">
                    <Button size="sm" className="w-full hover-lift">
                      {book.borrowCount >= 10 ? "Reserve Now" : "Borrow"}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-2 ${
                      savedBooks.has(book.id)
                        ? "bg-accent/10 text-accent"
                        : "bg-transparent"
                    }`}
                    onClick={() => toggleSave(book.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        savedBooks.has(book.id) ? "fill-accent" : ""
                      }`}
                    />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent
            value="community"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            <Card className="p-4 mb-4 bg-success/5 border-success/30 flex items-start gap-4">
              <Users className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Community Recommendations</p>
                <p className="text-muted-foreground">
                  Discover what fellow readers and your score level are loving
                  most.
                </p>
              </div>
            </Card>

            {communityPicks.map((book, index) => (
              <Card
                key={book.id}
                className="p-6 border-border hover:border-primary transition-smooth group animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4 mb-4">
                  <Link href="/catalog/1">
                    <div className="w-20 h-28 bg-gradient-to-br from-success/20 to-primary/20 rounded flex items-center justify-center flex-shrink-0 hover-lift cursor-pointer">
                      <Users className="w-8 h-8 text-success opacity-40" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Link href="/catalog/1">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-smooth cursor-pointer">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <Badge className="bg-accent/10 text-accent">
                        {book.community}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mt-3">
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
                          {book.rating}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-transparent">
                        {book.badge}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/catalog/1" className="flex-1">
                    <Button size="sm" className="w-full hover-lift">
                      Borrow Now
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-2 ${
                      savedBooks.has(book.id)
                        ? "bg-accent/10 text-accent"
                        : "bg-transparent"
                    }`}
                    onClick={() => toggleSave(book.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        savedBooks.has(book.id) ? "fill-accent" : ""
                      }`}
                    />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
