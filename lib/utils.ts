import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(value: string) {
  const s = value.trim()
  if (!s) return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function toTitleCase(value: string) {
  const s = value.trim()
  if (!s) return ""

  return s
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => capitalize(w.toLowerCase()))
    .join(" ")
}
