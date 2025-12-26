import { getAccessToken } from "./auth.service";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export async function getMyReservations() {
    const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message || 'Failed to fetch reservations');
    }
    const data = await response.json();
    return data;
}