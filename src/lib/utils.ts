import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a `<input type="date">` value into a *local* midnight Date.
 *
 * `new Date('2026-08-05')` is spec'd to parse bare date strings as UTC, so west of
 * UTC it lands on Aug 4 at 17:00 local — the date the user picked renders as the day
 * before. Building it from parts pins it to local midnight instead.
 */
export function parseDateInput(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

/** Format a Date back into the `yyyy-MM-dd` shape `<input type="date">` requires. */
export function toDateInputValue(date?: Date): string {
  return date ? format(new Date(date), 'yyyy-MM-dd') : '';
}
