const BRAND_PATTERN = /\s*(?:\||—|–|-|:)\s*CashClimb(?:\s+Guide)?\s*$/gi

export function cleanSeoTitle(value?: string | null) {
  return String(value || '')
    .replace(BRAND_PATTERN, '')
    .replace(/\s*(?:\||—|–)\s*/g, ': ')
    .replace(/\s+-\s+/g, ': ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function displayTitle(value?: string | null) {
  return cleanSeoTitle(value)
}
