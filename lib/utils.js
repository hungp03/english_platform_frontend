import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import "dayjs/locale/vi"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date DD/MM/YYYY
export function formatDate(date) {
  return dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : ''
}

// Format currency
export function formatCurrency(amount, currency = 'VND') {
  if (!amount) return '0 ₫'

  const numericAmount = Number(amount)
  if (isNaN(numericAmount)) return '0 ₫'

  // Handle VND formatting
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount)
  }

  // Handle other currencies
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numericAmount)
}
