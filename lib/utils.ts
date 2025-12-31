import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

 export const tierThresholds: Record<string, number> = {
    Bronze: 0,
    Silver: 500,
    Gold: 1000,
    Platinum: 2000,
  };
 export const tiers = ["Bronze", "Silver", "Gold", "Platinum"];

 export const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";