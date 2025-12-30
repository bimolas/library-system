import { Book } from "@/lib/types";
import { getAccessToken } from "./auth.service";
import { apiGetJson, apiPostJson } from "./api-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api";

export async function fetchBooks(search: string = ""): Promise<Book[]> {
  const res = await apiGetJson<any>(`${BASE_URL || ""}/books/search?q=${search}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch books");
  }

  const data = (await res.json()).map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      genre: item?.genre || [],
      description: item.description,
      coverImage: item.coverImage || "",
      totalCopies: item.totalCopies || 0,
      availableCopies: item.availableCopies || 0,
      rating: item.rating || 0,
      reviewCount: item.reviewCount,
      popularity: item.popularity,
      demandPressure: item.demandPressure,
      nextAvailableDate: item.nextAvailableDate
        ? new Date(item.nextAvailableDate)
        : undefined,
      publisher: item.publisher || "",
      publishedYear: item.publishedYear || 0,
      pages: item.pages || 0,
    };
  }) as Book[];
  return data;
}

export async function getBookById(bookId: string): Promise<Book> {
  const res = await apiGetJson<any>(`${BASE_URL || ""}/books/${bookId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch book details");
  }

  const item = await res.json();
  return {
    id: item.id,
    title: item.title,
    author: item.author,
    isbn: item.isbn,
    genre: item?.genre || [],
    description: item.description,
    coverImage: item.coverImage || "",
    totalCopies: item.totalCopies || 0,
    availableCopies: item.availableCopies || 0,
    rating: item.rating || 0,
    reviewCount: item.reviewCount,
    popularity: item.popularity,
    demandPressure: item.demandPressure,
    nextAvailableDate: item.nextAvailableDate
      ? new Date(item.nextAvailableDate)
      : undefined,
    publisher: item.publisher || "",
    publishedYear: item.publishedYear || 0,
    pages: item.pages || 0,
  } as Book;
}

export async function getComments(bookId: string): Promise<any[]> {
  const res = await apiGetJson<any>(`${BASE_URL || ""}/books/${bookId}/comments`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch book comments");
  }

  const data = await res.json();
  return data;
}

export async function createComment(
  bookId: string,
  message: string,
  rating: number
): Promise<any> {
  const res = await apiPostJson(`${BASE_URL || ""}/books/${bookId}/comments`, { message, rating });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to create comment");
  }

  const data = await res.json();
  return data;
}


