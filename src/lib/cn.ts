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

/**
 * `cn` for Base UI parts, whose `className` may also be a function of the
 * part's state. Same call shape as `cn` — consumer `className` last — but keeps
 * the function form working by merging the defaults into what it returns.
 */
export function cnState<State>(
  ...args: [...base: ClassValue[], className: string | ((state: State) => string | undefined) | undefined]
): string | ((state: State) => string) {
  const className = args[args.length - 1] as string | ((state: State) => string | undefined) | undefined
  const base = args.slice(0, -1) as ClassValue[]
  if (typeof className === 'function') return (state) => cn(base, className(state))
  return cn(base, className)
}
