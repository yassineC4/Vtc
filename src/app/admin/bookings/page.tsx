import { BookingsList } from '@/components/admin/BookingsList'
import { defaultLocale } from '@/lib/i18n'

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {defaultLocale === 'fr' ? 'Gestion des Réservations' : 'Bookings Management'}
      </h1>
      <BookingsList locale={defaultLocale} />
    </div>
  )
}


