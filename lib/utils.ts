import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToTimestamptz(time12h: string, dateStr: string): string {
  // parse the time string (e.g., "5:00 pm")
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  
  if (!match) return time12h;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toLowerCase();
  
  // convert to 24-hour format
  if (period === "pm" && hours !== 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }
  
  const hoursStr = hours.toString().padStart(2, "0");
  const timestamp = `${dateStr} ${hoursStr}:${minutes}:00-05`;
  
  return timestamp;
}
