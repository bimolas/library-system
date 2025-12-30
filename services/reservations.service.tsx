import { apiDeleteJson, apiGetJson, apiPostJson } from "./api-client";
import { getAccessToken } from "./auth.service";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function getMyReservations(limit?: number) {
  const response = await apiGetJson(`${BASE_URL}/api/reservations`);
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to fetch reservations");
  }
  const data = await response.json();
  if(limit) {
    return data.filter((_: any, index: number) => index < limit);
  }
  return data;
}

export async function reserveBook(
  bookId: string,
  durationDays: number,
  startDate: string
) {
  console.log("Reserving book:", { bookId, durationDays, startDate });
  const response = await apiPostJson(`${BASE_URL}/api/reservations`, {
    bookId,
    durationDays,
    startDate,
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to reserve book");
  }
  const data = await response.json();
  return data;
}

export async function cancelReservation(reservationId: string) {
  const response = await apiDeleteJson(
    `${BASE_URL}/api/reservations/${reservationId}`
  );
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to cancel reservation");
  }
  const data = await response.json();
  return data;
}

export async function getBookAvailability(bookId: string) {
  const response = await apiGetJson(
    `${BASE_URL}/api/books/${bookId}/available-slots`
  );
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(err.message || "Failed to check book availability");
  }
  const data = await response.json();
  return data;
}
