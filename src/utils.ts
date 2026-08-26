import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to split text into words, keeping punctuation mostly intact
export function parseWords(text: string): string[] {
  // Replace newlines with spaces and split by whitespace
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

// Calculates the focal point of a word for optimal eye positioning (ORP - Optimal Recognition Point)
export function getWordFocalPoint(word: string): { left: string; focal: string; right: string } {
  const len = word.length;
  if (len === 0) return { left: "", focal: "", right: "" };
  
  // The focal point is usually slightly left of center
  let focalIndex = 0;
  if (len === 1) focalIndex = 0;
  else if (len >= 2 && len <= 5) focalIndex = 1;
  else if (len >= 6 && len <= 9) focalIndex = 2;
  else if (len >= 10 && len <= 13) focalIndex = 3;
  else focalIndex = 4;

  return {
    left: word.substring(0, focalIndex),
    focal: word.charAt(focalIndex),
    right: word.substring(focalIndex + 1),
  };
}
