// Bad words list - loaded from badwords-generated.ts (auto-generated from badwords.txt)
// This is a client-side utility for filtering content

import { BAD_WORDS } from "./badwords-generated";

// Convert to lowercase set for faster lookups
const BAD_WORDS_SET = new Set(BAD_WORDS.map((word) => word.toLowerCase()));

/**
 * Checks if the given text contains any bad words (case-insensitive)
 * @param text - The text to check
 * @returns true if text contains bad words, false otherwise
 */
export function containsBadWords(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Check if any word in the text matches a bad word
  for (const word of words) {
    // Remove punctuation for matching
    const cleanWord = word.replace(/[^\w]/g, "");
    if (BAD_WORDS_SET.has(cleanWord)) {
      return true;
    }
  }

  return false;
}
