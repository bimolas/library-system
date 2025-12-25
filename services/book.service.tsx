import { Book } from "@/lib/types"
import { getAccessToken } from "./auth.service"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"

// export interface Book {
//     id: string
//     title: string
//     author: string
//     isbn: string
//     description: string
//     publicationYear: number
// }

export async function fetchBooks(search: string = ""): Promise<Book[]> {
  const res = await fetch(`${BASE_URL || ""}/books/search?q=${search}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || "Failed to fetch books")
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
        reviewCount: item.reviewCount ,
        popularity: item.popularity ,
        demandPressure: item.demandPressure ,
        nextAvailableDate: item.nextAvailableDate ? new Date(item.nextAvailableDate) : undefined,
        publisher: item.publisher || "",
        publishedYear: item.publishedYear || 0,
        pages: item.pages || 0,
    }
    }) as Book[]
  return data
}