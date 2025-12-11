'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Euro } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { AssignDriverModal } from './AssignDriverModal'
import { Database } from '@/types/database'
import { type Locale } from '@/lib/i18n'

type Booking = Database['public']['Tables']['bookings']['Row']
type Driver = Database['public']['Tables']['drivers']['Row']

interface BookingWithDriver extends Booking {
  driver?: Driver | null
}

interface PendingBookingsListProps {
  bookings: Booking[]
  drivers: Driver[]
  confirmedBookings: BookingWithDriver[]
  selectedDate: string
  locale: Locale
  onAssigned: () => void
}

export function PendingBookingsList({
  bookings,
  drivers,
  confirmedBookings,
  selectedDate,
  locale,
  onAssigned,
}: PendingBookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  if (bookings.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        {locale === 'fr' ? 'Aucune course en attente' : 'No pending bookings'}
      </div>
    )
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="p-2 space-y-2">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="bg-white border-yellow-300 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-3">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {booking.first_name} {booking.last_name}
                    </div>
                    <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                      {locale === 'fr' ? 'En attente' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      {formatPrice(booking.estimated_price, locale === 'fr' ? 'fr-FR' : 'en-US')}
                    </div>
                  </div>
                </div>

                {/* Time */}
                {booking.scheduled_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    {formatTime(booking.scheduled_date)}
                  </div>
                )}

                {/* Departure */}
                <div className="flex items-start gap-1 text-xs text-gray-700">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{booking.departure_address}</span>
                </div>

                {/* Arrival */}
                {booking.arrival_address && (
                  <div className="flex items-start gap-1 text-xs text-gray-700">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-600" />
                    <span className="line-clamp-2">{booking.arrival_address}</span>
                  </div>
                )}

                {/* Additional info */}
                <div className="flex gap-3 text-xs text-gray-500">
                  {booking.number_of_passengers && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {booking.number_of_passengers}
                    </div>
                  )}
                  {booking.estimated_duration && (
                    <div>
                      ~{Math.round(booking.estimated_duration / 60)}min
                    </div>
                  )}
                </div>

                {/* Assign button */}
                <Button
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => setSelectedBooking(booking)}
                >
                  {locale === 'fr' ? 'Assigner' : 'Assign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Driver Modal */}
      {selectedBooking && (
        <AssignDriverModal
          booking={selectedBooking}
          drivers={drivers}
          confirmedBookings={confirmedBookings}
          selectedDate={selectedDate}
          locale={locale}
          onClose={() => setSelectedBooking(null)}
          onAssigned={() => {
            setSelectedBooking(null)
            onAssigned()
          }}
        />
      )}
    </>
  )
}

