import { apiGetJson, apiPostJson } from "./api-client";
import { getAccessToken } from "./auth.service";

type BorrowFilter = "COMPLETED" | "ACTIVE";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";


export async function getMyBorrowings(filter?: BorrowFilter, limit?: number) {
  const res = await apiGetJson(`${BASE_URL || ""}/borrowing`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch borrowings");
  }

  const data = await res.json();
  if (filter) {
    return data.filter((borrow: any) => borrow.status === filter);
  }
  if(limit) {
    return data.filter((_: any, index: number) => index < limit); 
  }
  return data;
}

export async function borrowBook(bookId: string, durationDays: number) {
  const response = await apiPostJson(`${BASE_URL || ""}/borrowing`, { bookId, durationDays });

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to borrow book");
  }

  const data = await response.json();
  return data;
}

export async function returnBook(borrowId: string) {
  const response = await apiPostJson(`${BASE_URL || ""}/borrowing/${borrowId}/return`, {});
  
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to return book");
  }

  const data = await response.json();
  return data;
}
