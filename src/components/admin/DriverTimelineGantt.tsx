'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { MapPin, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Database } from '@/types/database'
import { type Locale } from '@/lib/i18n'

type Booking = Database['public']['Tables']['bookings']['Row']
type Driver = Database['public']['Tables']['drivers']['Row']

interface BookingWithDriver extends Booking {
  driver?: Driver | null
}

interface DriverTimelineGanttProps {
  drivers: Driver[]
  bookings: BookingWithDriver[]
  selectedDate: string
  locale: Locale
  onDriverToggle: (driverId: string, isOnline: boolean) => void
}

// Heures de 6h à 23h (18 heures)
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6-23
const HOUR_WIDTH = 50 // pixels par heure

export function DriverTimelineGantt({
  drivers,
  bookings,
  selectedDate,
  locale,
  onDriverToggle,
}: DriverTimelineGanttProps) {
  const bookingsByDriver = useMemo(() => {
    const map = new Map<string, BookingWithDriver[]>()
    drivers.forEach(driver => {
      map.set(driver.id, bookings.filter(b => b.driver_id === driver.id))
    })
    return map
  }, [bookings, drivers])

  // Filtrer seulement les chauffeurs "En Service" (is_online = true)
  const activeDrivers = drivers.filter(d => d.is_online)

  const getBookingPosition = (booking: BookingWithDriver) => {
    if (!booking.scheduled_date) return { left: 0, width: 0 }
    
    const bookingDate = new Date(booking.scheduled_date)
    const hours = bookingDate.getHours()
    const minutes = bookingDate.getMinutes()
    
    // Si l'heure est avant 6h ou après 23h, ne pas afficher
    if (hours < 6 || hours >= 24) return { left: 0, width: 0 }
    
    const hoursFromStart = hours - 6 + minutes / 60
    const duration = booking.estimated_duration ? booking.estimated_duration / 60 : 1 // Convert minutes to hours
    
    return {
      left: hoursFromStart * HOUR_WIDTH,
      width: Math.max(duration * HOUR_WIDTH, 60), // Minimum width of 60px
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBookingColor = (booking: BookingWithDriver) => {
    if (booking.status === 'completed') {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-700',
      }
    }
    if (booking.status === 'in_progress') {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        text: 'text-blue-800',
      }
    }
    // confirmed
    return {
      bg: 'bg-green-100',
      border: 'border-green-400',
      text: 'text-green-800',
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with driver list and hours */}
      <div className="flex-shrink-0 border-b bg-white">
        {/* Hours header */}
        <div className="flex" style={{ minWidth: `${18 * HOUR_WIDTH + 180}px` }}>
          <div className="w-[180px] p-2 text-xs font-semibold border-r bg-gray-50">
            {locale === 'fr' ? 'Chauffeur' : 'Driver'}
          </div>
          <div className="flex-1 flex">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-r p-1 text-xs font-medium text-gray-600 text-center"
                style={{ width: `${HOUR_WIDTH}px`, minWidth: `${HOUR_WIDTH}px` }}
              >
                {hour.toString().padStart(2, '0')}h
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <div style={{ minWidth: `${18 * HOUR_WIDTH + 180}px` }}>
          {/* Driver rows */}
          <div className="divide-y">
            {drivers.map((driver) => {
              const driverBookings = bookingsByDriver.get(driver.id) || []
              const isActive = driver.is_online
              
              return (
                <div
                  key={driver.id}
                  className={`flex relative ${!isActive ? 'opacity-40 bg-gray-50' : ''}`}
                  style={{ minHeight: '100px' }}
                >
                  {/* Driver name column with toggle */}
                  <div className="w-[180px] p-2 border-r flex flex-col justify-center bg-white">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => onDriverToggle(driver.id, checked)}
                        className="scale-75"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm ${!isActive ? 'text-gray-400' : ''}`}>
                          {driver.first_name} {driver.last_name}
                        </div>
                        <Badge
                          className={`mt-1 text-xs ${
                            isActive
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          {isActive
                            ? locale === 'fr' ? 'En Service' : 'On Duty'
                            : locale === 'fr' ? 'Repos' : 'Off Duty'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Timeline grid */}
                  <div className="flex-1 relative">
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 flex">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="border-r border-gray-200"
                          style={{ width: `${HOUR_WIDTH}px`, minWidth: `${HOUR_WIDTH}px` }}
                        />
                      ))}
                    </div>

                    {/* Bookings */}
                    {driverBookings.map((booking) => {
                      const position = getBookingPosition(booking)
                      const colors = getBookingColor(booking)
                      
                      if (position.left === 0 && position.width === 0) return null
                      
                      return (
                        <div
                          key={booking.id}
                          className={`absolute top-1 bottom-1 rounded-md shadow-sm border-2 p-1.5 overflow-hidden ${colors.bg} ${colors.border}`}
                          style={{
                            left: `${position.left}px`,
                            width: `${position.width}px`,
                            minWidth: '60px',
                          }}
                          title={`${booking.first_name} ${booking.last_name} - ${formatTime(booking.scheduled_date)}`}
                        >
                          <div className={`text-xs font-semibold truncate ${colors.text}`}>
                            {booking.first_name} {booking.last_name}
                          </div>
                          {booking.scheduled_date && (
                            <div className={`text-xs mt-0.5 ${colors.text} opacity-75`}>
                              <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                              {formatTime(booking.scheduled_date)}
                            </div>
                          )}
                          <div className={`text-xs truncate mt-0.5 ${colors.text} opacity-75`}>
                            <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
                            {booking.departure_address.split(',')[0]}
                          </div>
                          <div className={`text-xs font-bold mt-1 ${colors.text}`}>
                            {formatPrice(booking.estimated_price, locale === 'fr' ? 'fr-FR' : 'en-US')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {drivers.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">
              {locale === 'fr' ? 'Aucun chauffeur enregistré' : 'No drivers registered'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

