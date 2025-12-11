'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getTranslations, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type Booking = Database['public']['Tables']['bookings']['Row']
type Driver = Database['public']['Tables']['drivers']['Row']

interface BookingWithDriver extends Booking {
  driver?: Driver | null
}

interface PlanningViewProps {
  locale: Locale
}

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0-23
const HOUR_WIDTH = 60 // pixels per hour

export function PlanningView({ locale }: PlanningViewProps) {
  const [bookings, setBookings] = useState<BookingWithDriver[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load drivers via API
      const driversResponse = await fetch('/api/drivers', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!driversResponse.ok) {
        if (driversResponse.status === 401) {
          throw new Error(locale === 'fr' ? 'Non authentifié' : 'Unauthorized')
        }
        throw new Error(`HTTP error! status: ${driversResponse.status}`)
      }
      const driversResult = await driversResponse.json()
      setDrivers(driversResult.data || [])

      // Load bookings for selected date via API
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const bookingsResponse = await fetch('/api/bookings', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!bookingsResponse.ok) {
        if (bookingsResponse.status === 401) {
          throw new Error(locale === 'fr' ? 'Non authentifié' : 'Unauthorized')
        }
        throw new Error(`HTTP error! status: ${bookingsResponse.status}`)
      }
      const bookingsResult = await bookingsResponse.json()
      
      // Filtrer les bookings côté client pour la date sélectionnée
      const filteredBookings = (bookingsResult.data as BookingWithDriver[] || [])
        .filter((booking: BookingWithDriver) => {
          if (!booking.scheduled_date) return false
          const bookingDate = new Date(booking.scheduled_date)
          return bookingDate >= startOfDay && 
                 bookingDate <= endOfDay && 
                 (booking.status === 'confirmed' || booking.status === 'in_progress')
        })
        .sort((a: BookingWithDriver, b: BookingWithDriver) => {
          if (!a.scheduled_date || !b.scheduled_date) return 0
          return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
        })
      
      setBookings(filteredBookings)
    } catch (error) {
      console.error('Error loading data:', error)
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        alert(locale === 'fr' ? 'Vous devez être connecté pour voir le planning' : 'You must be logged in to view planning')
      }
    } finally {
      setLoading(false)
    }
  }

  const bookingsByDriver = useMemo(() => {
    const map = new Map<string, BookingWithDriver[]>()
    drivers.forEach(driver => {
      map.set(driver.id, bookings.filter(b => b.driver_id === driver.id))
    })
    return map
  }, [bookings, drivers])

  const getBookingPosition = (booking: BookingWithDriver) => {
    if (!booking.scheduled_date) return { left: 0, width: 0 }
    
    const bookingDate = new Date(booking.scheduled_date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const hoursFromStart = bookingDate.getHours() + bookingDate.getMinutes() / 60
    const duration = booking.estimated_duration ? booking.estimated_duration / 60 : 1 // Convert minutes to hours
    
    return {
      left: hoursFromStart * HOUR_WIDTH,
      width: Math.max(duration * HOUR_WIDTH, 80), // Minimum width of 80px
    }
  }

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {locale === 'fr' ? 'Planning Journalier' : 'Daily Planning'}
        </h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-3 py-1"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
            {locale === 'fr' ? "Aujourd'hui" : 'Today'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Timeline header */}
            <div className="sticky top-0 z-10 bg-white border-b">
              <div className="flex" style={{ minWidth: `${24 * HOUR_WIDTH + 200}px` }}>
                <div className="w-[200px] p-4 font-bold border-r">
                  {locale === 'fr' ? 'Chauffeur' : 'Driver'}
                </div>
                <div className="flex-1 flex">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-r p-2 text-xs font-medium text-gray-600"
                      style={{ width: `${HOUR_WIDTH}px`, minWidth: `${HOUR_WIDTH}px` }}
                    >
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline rows for each driver */}
            <div className="divide-y">
              {drivers.map((driver) => {
                const driverBookings = bookingsByDriver.get(driver.id) || []
                
                return (
                  <div
                    key={driver.id}
                    className="flex relative"
                    style={{ minWidth: `${24 * HOUR_WIDTH + 200}px`, height: '120px' }}
                  >
                    {/* Driver name column */}
                    <div className="w-[200px] p-4 border-r flex flex-col justify-center">
                      <div className="font-semibold">
                        {driver.first_name} {driver.last_name}
                      </div>
                      <Badge
                        className={`mt-1 w-fit ${
                          driver.is_online
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {driver.is_online
                          ? locale === 'fr' ? 'En ligne' : 'Online'
                          : locale === 'fr' ? 'Hors ligne' : 'Offline'}
                      </Badge>
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
                        const bookingDate = booking.scheduled_date ? new Date(booking.scheduled_date) : null
                        
                        return (
                          <div
                            key={booking.id}
                            className="absolute top-2 bottom-2 rounded-lg shadow-md border-2 p-2 overflow-hidden"
                            style={{
                              left: `${position.left}px`,
                              width: `${position.width}px`,
                              backgroundColor: booking.status === 'in_progress' ? '#DBEAFE' : '#D1FAE5',
                              borderColor: booking.status === 'in_progress' ? '#3B82F6' : '#10B981',
                              minWidth: '80px',
                            }}
                          >
                            <div className="text-xs font-semibold truncate">
                              {booking.first_name} {booking.last_name}
                            </div>
                            <div className="text-xs text-gray-600 truncate mt-1">
                              <MapPin className="h-3 w-3 inline" /> {booking.departure_address.split(',')[0]}
                            </div>
                            {bookingDate && (
                              <div className="text-xs text-gray-600 mt-1">
                                <Clock className="h-3 w-3 inline" />{' '}
                                {bookingDate.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                            <div className="text-xs font-bold text-primary mt-1">
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
          </div>
        </CardContent>
      </Card>

      {drivers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {locale === 'fr' ? 'Aucun chauffeur enregistré' : 'No drivers registered'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

