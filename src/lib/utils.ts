import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string in Montreal timezone (Eastern Time)
 * @param dateString - ISO date string to format
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string in en-CA locale
 */
export function formatDate(dateString: string, includeTime = false) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Toronto',
  }
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  return new Date(dateString).toLocaleString('en-CA', options)
}
