import { getAccessToken } from "./auth.service";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
export async function getMyBorrowingsHistory(){
    const res = await fetch(`${BASE_URL || ""}/borrowing`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || "Failed to fetch borrowings")
    }

    const data = (await res.json());
    return data;
}