import { Book } from "@/lib/types";
import { getAccessToken } from "./auth.service";
import { apiDeleteJson, apiGetJson, apiPostJson } from "./api-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api";

export async function fetchBooks(search: string = ""): Promise<Book[]> {
  const res = await apiGetJson<any>(
    `${BASE_URL || ""}/books/search?q=${search}`
  );

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
      genre: item?.genre || "",
      description: item.description,
      coverImage: item.coverImage || "",
      totalCopies: item.totalCopies || 0,
      availableCopies: item.availableCopies || 0,
      rating: item.rating,
      reviewCount: item.reviewCount,
      popularity: item.popularity,
      demandPressure: item.demandPressure,
      nextAvailableDate: item.nextAvailableDate
        ? new Date(item.nextAvailableDate)
        : undefined,
      publisher: item.publisher || "",
      publishedYear: item.publishedYear || 0,
      pages: item.pages || 0,
      borrowCount: item.borrowCount,
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
  const res = await apiGetJson<any>(
    `${BASE_URL || ""}/books/${bookId}/comments`
  );

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
  const res = await apiPostJson(`${BASE_URL || ""}/books/${bookId}/comments`, {
    message,
    rating,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to create comment");
  }

  const data = await res.json();
  return data;
}

export async function getMyRecommendedBooks(): Promise<any[]> {
  const res = await apiGetJson<any>(
    `${BASE_URL || ""}/analytics/user/recommendations`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch recommended books");
  }

  const data = (await res.json()).map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      genre: item?.genre,
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
  }) as Book[];
  return data;
}

export async function getTrendingBooks(): Promise<any[]> {
  const res = await apiGetJson<any>(
    `${BASE_URL || ""}/analytics/trending-books`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch trending books");
  }

  const data = (await res.json()).map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      author: item.author,
      genre: item?.genre,
      totalCopies: item.totalCopies || 0,
      availableCopies: item.availableCopies || 0,
      rating: item.avgRating || 0,
      reviewCount: item.reviewCount,
      demandPressure: item.demandPressure,
      borrowCount: item.borrowCount,
      nextAvailableDate: item.nextAvailableDate
        ? new Date(item.nextAvailableDate)
        : undefined,
    } as Book;
  }) as Book[];
  return data;
}

export async function createBook(
  bookData: any,
  imageFile: File | null
): Promise<any> {
  if (imageFile === null) {
    throw new Error("No cover image file provided");
  }
  const form = new FormData();
  // append fields
  Object.entries(bookData || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  });
  // append image file under "profileImage" (backend should expect this field)
  form.append("file", imageFile);
  const res = await fetch(`${BASE_URL || ""}/books`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    } as any, // allowing FormData request to omit Content-Type
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to create book");
  }

  return res.json();
}

export async function addBookCopies(
  bookId: string,
  newTotalCopies: number
): Promise<any> {
  const token = await apiPostJson(`${BASE_URL || ""}/books/${bookId}/copies`, {
    quantity: newTotalCopies,
  });

  if (!token.ok) {
    const err = await token.json().catch(() => ({ message: token.statusText }));
    throw new Error(err.message || "Failed to add book copies");
  }

  const data = await token.json();
  return data;
}

export async function deleteBookCopies(
  bookId: string,
  quantity: number
): Promise<any> {
  const token = await apiDeleteJson(
    `${BASE_URL || ""}/books/${bookId}/copies?quantity=${quantity}`
  );

  if (!token.ok) {
    const err = await token.json().catch(() => ({ message: token.statusText }));
    throw new Error(err.message || "Failed to delete book copies");
  }

  const data = await token.json();
  return data;
}

export async function deleteBook(bookId: string): Promise<any> {
  const token = await apiDeleteJson(`${BASE_URL || ""}/books/${bookId}`);

  if (!token.ok) {
    const err = await token.json().catch(() => ({ message: token.statusText }));
    throw new Error(err.message || "Failed to delete book");
  }

  const data = await token.json();
  return data;
}

export async function updateBook(
  id: string,
  bookData: any,
  imageFile?: File
): Promise<any> {
  let res; 

  if (imageFile) {
    const form = new FormData();
    // append fields
    Object.entries(bookData || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });
    // append image file under "profileImage" (backend should expect this field)
    form.append("file", imageFile);
    res = await fetch(`${BASE_URL || ""}/books/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      } as any, // allowing FormData request to omit Content-Type
      body: form,
    });
  } else {
    res = await fetch(`${BASE_URL || ""}/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(bookData),
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to update book");
  }

  return res.json();
}


export async function getAnalyticsSummary(): Promise<any> {
  const res = await apiGetJson<any>(`${BASE_URL || ""}/analytics/summary`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch analytics summary");
  }

  const data = await res.json();
  return data;
}

export async function getBookAvailabilityData(bookId: string): Promise<any> {
  const res = await apiGetJson<any>(
    `${BASE_URL || ""}/analytics/book/${bookId}/availability`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch book availability data");
  }

  const data = await res.json();
  return data;
}