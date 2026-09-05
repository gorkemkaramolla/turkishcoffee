import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes so a consumer's `className` always wins over the
 * component's defaults (`px-4` passed in beats a built-in `px-3`).
 * Always call this last, with `className` as the final argument.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
