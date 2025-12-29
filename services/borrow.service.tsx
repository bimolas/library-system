import { getAccessToken } from "./auth.service";

type BorrowFilter = "COMPLETED" | "ACTIVE";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
export async function getMyBorrowings(filter?: BorrowFilter) {
  const res = await fetch(`${BASE_URL || ""}/borrowing`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Failed to fetch borrowings");
  }

  const data = await res.json();
  if (filter) {
    return data.filter((borrow: any) => borrow.status === filter);
  }
  return data;
}

export async function borrowBook(bookId: string, durationDays: number) {
  const response = await fetch(`${BASE_URL || ""}/borrowing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ bookId, durationDays }),
  });

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
  const response = await fetch(
    `${BASE_URL || ""}/borrowing/${borrowId}/return`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to return book");
  }

  const data = await response.json();
  return data;
}
