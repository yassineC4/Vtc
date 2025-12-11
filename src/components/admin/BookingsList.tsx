'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getTranslations, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Calendar, MapPin, User, Phone, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatPrice, formatDistance, formatDuration } from '@/lib/utils'

type Booking = Database['public']['Tables']['bookings']['Row']
type Driver = Database['public']['Tables']['drivers']['Row']

interface BookingWithDriver extends Booking {
  driver?: Driver | null
}

interface BookingsListProps {
  locale: Locale
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  in_progress: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
}

export function BookingsList({ locale }: BookingsListProps) {
  const t = getTranslations(locale)
  const [bookings, setBookings] = useState<BookingWithDriver[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load drivers via API
      const driversResponse = await fetch('/api/drivers', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (driversResponse.ok) {
        const driversResult = await driversResponse.json()
        setDrivers(driversResult.data || [])
      } else {
        console.error('Error loading drivers:', driversResponse.status)
      }

      // Load bookings via API
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
      setBookings((bookingsResult.data as BookingWithDriver[]) || [])
    } catch (error) {
      console.error('Error loading data:', error)
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        alert(locale === 'fr' ? 'Vous devez être connecté pour voir les réservations' : 'You must be logged in to view bookings')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDriver = async (bookingId: string, driverId: string | null) => {
    try {
      const updateData: any = {
        id: bookingId,
        driver_id: driverId,
        driver_assigned_at: driverId ? new Date().toISOString() : null,
        status: driverId ? 'confirmed' : 'pending',
      }

      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(locale === 'fr' ? 'Non authentifié' : 'Unauthorized')
        }
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      // Reload bookings to get updated data
      await loadData()

      // TODO: Send email to client if driver assigned
      if (driverId) {
        // Find booking to get client email
        const booking = bookings.find(b => b.id === bookingId)
        if (booking?.email) {
          // Email sending will be implemented later
          console.log(`Should send confirmation email to ${booking.email}`)
        }
      }
    } catch (error) {
      console.error('Error assigning driver:', error)
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur lors de l\'assignation' : 'Error assigning driver')
      alert(errorMessage)
    }
  }

  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ id: bookingId, status }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(locale === 'fr' ? 'Non authentifié' : 'Unauthorized')
        }
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      await loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status')
      alert(errorMessage)
    }
  }

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus)

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
          {locale === 'fr' ? 'Gestion des Réservations' : 'Bookings Management'}
        </h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={locale === 'fr' ? 'Filtrer par statut' : 'Filter by status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === 'fr' ? 'Tous' : 'All'}</SelectItem>
            <SelectItem value="pending">{locale === 'fr' ? 'En attente' : 'Pending'}</SelectItem>
            <SelectItem value="confirmed">{locale === 'fr' ? 'Confirmé' : 'Confirmed'}</SelectItem>
            <SelectItem value="in_progress">{locale === 'fr' ? 'En cours' : 'In Progress'}</SelectItem>
            <SelectItem value="completed">{locale === 'fr' ? 'Terminé' : 'Completed'}</SelectItem>
            <SelectItem value="cancelled">{locale === 'fr' ? 'Annulé' : 'Cancelled'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => {
          const StatusIcon = statusIcons[booking.status]
          const statusColor = statusColors[booking.status]
          
          return (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {booking.first_name} {booking.last_name}
                      </CardTitle>
                      <Badge className={statusColor}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {locale === 'fr'
                          ? booking.status === 'pending'
                            ? 'En attente'
                            : booking.status === 'confirmed'
                            ? 'Confirmé'
                            : booking.status === 'in_progress'
                            ? 'En cours'
                            : booking.status === 'completed'
                            ? 'Terminé'
                            : 'Annulé'
                          : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      {booking.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {booking.phone}
                        </div>
                      )}
                      {booking.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {booking.email}
                        </div>
                      )}
                      {booking.scheduled_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.scheduled_date).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {locale === 'fr' ? 'Départ:' : 'Departure:'}
                        </p>
                        <p className="text-sm text-gray-600">{booking.departure_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {locale === 'fr' ? 'Arrivée:' : 'Arrival:'}
                        </p>
                        <p className="text-sm text-gray-600">{booking.arrival_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {locale === 'fr' ? 'Prix estimé:' : 'Estimated price:'}
                      </span>
                      <span className="ml-2 text-primary font-bold">
                        {formatPrice(booking.estimated_price, locale === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </div>
                    {booking.estimated_distance && (
                      <div>
                        <span className="font-medium text-gray-700">
                          {locale === 'fr' ? 'Distance:' : 'Distance:'}
                        </span>
                        <span className="ml-2">
                          {formatDistance(booking.estimated_distance, locale)}
                        </span>
                      </div>
                    )}
                    {booking.estimated_duration && (
                      <div>
                        <span className="font-medium text-gray-700">
                          {locale === 'fr' ? 'Durée:' : 'Duration:'}
                        </span>
                        <span className="ml-2">
                          {formatDuration(booking.estimated_duration, locale)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select
                        value={booking.driver_id || 'unassigned'}
                        onValueChange={(value) =>
                          handleAssignDriver(booking.id, value === 'unassigned' ? null : value)
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder={locale === 'fr' ? 'Assigner à...' : 'Assign to...'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            {locale === 'fr' ? 'Non assigné' : 'Unassigned'}
                          </SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.first_name} {driver.last_name}
                              {driver.is_online && (
                                <span className="ml-2 text-green-600">●</span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {booking.driver && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>
                            {locale === 'fr' ? 'Assigné à' : 'Assigned to'}:{' '}
                            <span className="font-medium">
                              {booking.driver.first_name} {booking.driver.last_name}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        >
                          {locale === 'fr' ? 'Confirmer' : 'Confirm'}
                        </Button>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                        >
                          {locale === 'fr' ? 'Démarrer' : 'Start'}
                        </Button>
                      )}
                      {booking.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        >
                          {locale === 'fr' ? 'Terminer' : 'Complete'}
                        </Button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        >
                          {locale === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {locale === 'fr' ? 'Aucune réservation' : 'No bookings'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

