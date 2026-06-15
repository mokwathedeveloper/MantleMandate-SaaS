import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MANTLE_EXPLORER } from './constants'
import type { UserPreferences } from '@/hooks/usePreferences'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// "Currency display" select on the Settings → Display page stores one of
// these option strings; map it to an ISO 4217 code for Intl.NumberFormat
// (MNT — Mantle's native token — has no ISO currency code, so it falls
// back to plain number formatting with an "MNT" suffix).
const CURRENCY_CODES: Record<string, string> = {
  'USD ($)': 'USD',
  'EUR (€)': 'EUR',
  'GBP (£)': 'GBP',
  'MNT':     'MNT',
}

// Compact symbol for the same options, used for chart axis labels where a
// full Intl.NumberFormat currency string would be too wide (e.g. "$45k").
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD ($)': '$',
  'EUR (€)': '€',
  'GBP (£)': '£',
  'MNT':     '',
}

// "Number format" select stores a sample (e.g. "1.234,56"); map it to a
// locale that produces matching grouping/decimal separators.
const NUMBER_FORMAT_LOCALES: Record<string, string> = {
  '1,234.56': 'en-US',
  '1.234,56': 'de-DE',
  '1 234.56': 'fr-FR',
}

// "Date format" select stores a sample (e.g. "DD/MM/YYYY"); map it to a
// locale that produces matching field ordering for Intl.DateTimeFormat.
const DATE_FORMAT_LOCALES: Record<string, string> = {
  'DD/MM/YYYY': 'en-GB',
  'YYYY-MM-DD': 'en-CA',
  'MM/DD/YYYY': 'en-US',
}

interface CurrencyOpts {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export function formatCurrency(amount: number, prefs?: Partial<UserPreferences>, opts?: CurrencyOpts): string {
  const currencyOption = prefs?.currency ?? 'USD ($)'
  const locale = NUMBER_FORMAT_LOCALES[prefs?.numberFormat ?? '1,234.56'] ?? 'en-US'
  const minimumFractionDigits = opts?.minimumFractionDigits ?? 2
  const maximumFractionDigits = opts?.maximumFractionDigits ?? Math.max(minimumFractionDigits, 2)

  if (currencyOption === 'MNT') {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount)
    return `${formatted} MNT`
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY_CODES[currencyOption] ?? 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

// Compact "$45k"-style label for chart axes — abbreviates to thousands and
// uses the user's chosen currency symbol (MNT has no symbol, so it suffixes).
export function formatCompactCurrency(amount: number, prefs?: Partial<UserPreferences>): string {
  const currencyOption = prefs?.currency ?? 'USD ($)'
  const symbol = CURRENCY_SYMBOLS[currencyOption] ?? '$'
  const abbreviated = `${(amount / 1000).toFixed(0)}k`
  return symbol ? `${symbol}${abbreviated}` : `${abbreviated} MNT`
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function explorerTxUrl(txHash: string): string {
  return `${MANTLE_EXPLORER}/tx/${txHash}`
}

export function explorerAddressUrl(address: string): string {
  return `${MANTLE_EXPLORER}/address/${address}`
}

export function formatDate(dateString: string, prefs?: Partial<UserPreferences>): string {
  const date = new Date(dateString)
  const locale = DATE_FORMAT_LOCALES[prefs?.dateFormat ?? '']
  if (!locale) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// Short "month day" label for chart axes — no year, but field ordering
// still follows the user's chosen date format (e.g. "5 Jun" for DD/MM/YYYY).
export function formatDateShort(dateString: string, prefs?: Partial<UserPreferences>): string {
  const date = new Date(dateString)
  const locale = DATE_FORMAT_LOCALES[prefs?.dateFormat ?? ''] ?? 'en-US'
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

// Full date + time, locale-aware. Used where a row's full timestamp matters
// (trade history, audit logs) rather than just the date.
export function formatDateTime(dateString: string, prefs?: Partial<UserPreferences>): string {
  const date = new Date(dateString)
  const locale = DATE_FORMAT_LOCALES[prefs?.dateFormat ?? ''] ?? 'en-US'
  return date.toLocaleString(locale, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
