import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatDistance(distance: number, locale: string = 'fr-FR'): string {
  if (locale === 'en') {
    const miles = distance / 1609.34
    return miles < 1 
      ? `${Math.round(distance)} m`
      : `${miles.toFixed(1)} mi`
  }
  return distance < 1000 
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(1)} km`
}

export function formatDuration(seconds: number, locale: string = 'fr-FR'): string {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  // Si c'est en anglais, utiliser le format "Xh Ymin" ou juste "Ymin" si moins d'une heure
  if (locale === 'en') {
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes} min`
  }

  // Si c'est en arabe
  if (locale === 'ar') {
    if (hours > 0) {
      return minutes > 0 ? `${hours}س ${minutes}د` : `${hours}س`
    }
    return `${minutes} د`
  }

  // Format français par défaut : "Xh Ymin" ou juste "Ymin" si moins d'une heure
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
  }
  return `${minutes} min`
}

