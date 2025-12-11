'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PendingBookingsList } from './PendingBookingsList'
import { DriverTimelineGantt } from './DriverTimelineGantt'
import { getTranslations, type Locale } from '@/lib/i18n'
import { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']
type Driver = Database['public']['Tables']['drivers']['Row']

interface BookingWithDriver extends Booking {
  driver?: Driver | null
}

interface DispatchDashboardProps {
  locale: Locale
}

export function DispatchDashboard({ locale }: DispatchDashboardProps) {
  const router = useRouter()
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [confirmedBookings, setConfirmedBookings] = useState<BookingWithDriver[]>([])
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
      // Load drivers - avec credentials pour inclure les cookies de session
      const driversResponse = await fetch('/api/drivers', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!driversResponse.ok) {
        if (driversResponse.status === 401) {
          // Rediriger vers login si non authentifié
          setLoading(false)
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${driversResponse.status}`)
      }
      const driversResult = await driversResponse.json()
      setDrivers(driversResult.data || [])

      // Load bookings - avec credentials pour inclure les cookies de session
      const bookingsResponse = await fetch('/api/bookings', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!bookingsResponse.ok) {
        if (bookingsResponse.status === 401) {
          // Rediriger vers login si non authentifié
          setLoading(false)
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${bookingsResponse.status}`)
      }
      const bookingsResult = await bookingsResponse.json()
      const allBookings = bookingsResult.data as BookingWithDriver[] || []

      // Filtrer par date et statut
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const dayBookings = allBookings.filter((booking) => {
        if (!booking.scheduled_date) return false
        const bookingDate = new Date(booking.scheduled_date)
        return bookingDate >= startOfDay && bookingDate <= endOfDay
      })

      // Séparer pending et confirmed
      const pending = dayBookings.filter(b => b.status === 'pending')
      const confirmed = dayBookings.filter(b => 
        b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'completed'
      )

      setPendingBookings(pending as Booking[])
      setConfirmedBookings(confirmed)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
      // Si erreur 401 non gérée, rediriger vers login
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/login')
      }
    }
  }

  const handleBookingAssigned = () => {
    // Recharger les données après assignation
    loadData()
  }

  const handleDriverToggle = async (driverId: string, isOnline: boolean) => {
    try {
      const response = await fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ id: driverId, is_online: isOnline }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Mettre à jour l'état local
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, is_online: isOnline } : d))
    } catch (error) {
      console.error('Error toggling driver status:', error)
      alert(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating driver status')
    }
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Date selector - compact */}
      <div className="flex justify-between items-center mb-2 px-1">
        <h1 className="text-xl font-bold">
          {locale === 'fr' ? 'Dispatch & Planning' : 'Dispatch & Planning'}
        </h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      {/* Main content: 30/70 split */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left column: Pending bookings (30%) */}
        <div className="w-[30%] border rounded-lg bg-gray-50 flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-yellow-100 border-b font-semibold text-sm sticky top-0">
            {locale === 'fr' ? 'Courses à attribuer' : 'Pending Assignments'} ({pendingBookings.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            <PendingBookingsList
              bookings={pendingBookings}
              drivers={drivers}
              confirmedBookings={confirmedBookings}
              selectedDate={selectedDate}
              locale={locale}
              onAssigned={handleBookingAssigned}
            />
          </div>
        </div>

        {/* Right column: Timeline Gantt (70%) */}
        <div className="flex-1 border rounded-lg bg-white flex flex-col overflow-hidden">
          <DriverTimelineGantt
            drivers={drivers}
            bookings={confirmedBookings}
            selectedDate={selectedDate}
            locale={locale}
            onDriverToggle={handleDriverToggle}
          />
        </div>
      </div>
    </div>
  )
}

