'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react'
import { Database } from '@/types/database'
import { type Locale } from '@/lib/i18n'
import { createWhatsAppUrl, formatPhoneForWhatsApp } from '@/lib/whatsapp'

type Booking = Database['public']['Tables']['bookings']['Row']
type Driver = Database['public']['Tables']['drivers']['Row']

interface BookingWithDriver extends Booking {
  driver?: Driver | null
}

interface AssignDriverModalProps {
  booking: Booking
  drivers: Driver[]
  confirmedBookings: BookingWithDriver[]
  selectedDate: string
  locale: Locale
  onClose: () => void
  onAssigned: () => void
}

export function AssignDriverModal({
  booking,
  drivers,
  confirmedBookings,
  selectedDate,
  locale,
  onClose,
  onAssigned,
}: AssignDriverModalProps) {
  const [assigning, setAssigning] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  // Calculer les chauffeurs disponibles pour ce créneau
  const availableDrivers = useMemo(() => {
    if (!booking.scheduled_date) return drivers.filter(d => d.is_online)

    const bookingDate = new Date(booking.scheduled_date)
    const bookingStart = bookingDate.getTime()
    // Utiliser estimated_duration en minutes, avec un minimum de 30 minutes
    const bookingDuration = booking.estimated_duration || 30
    const bookingEnd = bookingStart + bookingDuration * 60 * 1000

    // Filtrer les chauffeurs en ligne
    const onlineDrivers = drivers.filter(d => d.is_online)

    // Pour chaque chauffeur, vérifier s'il a une course qui chevauche
    return onlineDrivers.filter(driver => {
      const driverBookings = confirmedBookings.filter(b => 
        b.driver_id === driver.id && 
        (b.status === 'confirmed' || b.status === 'in_progress')
      )

      // Vérifier si une course chevauche
      const hasConflict = driverBookings.some(existingBooking => {
        if (!existingBooking.scheduled_date) return false
        
        const existingStart = new Date(existingBooking.scheduled_date).getTime()
        const existingDuration = existingBooking.estimated_duration || 30
        const existingEnd = existingStart + existingDuration * 60 * 1000

        // Chevauchement si : 
        // - La nouvelle course commence avant la fin de l'ancienne ET
        // - La nouvelle course se termine après le début de l'ancienne
        // On ajoute un buffer de 15 minutes entre les courses pour le temps de trajet
        const buffer = 15 * 60 * 1000 // 15 minutes en millisecondes
        return (bookingStart < existingEnd + buffer) && (bookingEnd + buffer > existingStart)
      })

      return !hasConflict
    })
  }, [booking, drivers, confirmedBookings])

  const handleAssign = async () => {
    if (!selectedDriverId) return

    setAssigning(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          id: booking.id,
          driver_id: selectedDriverId,
          driver_assigned_at: new Date().toISOString(),
          status: 'confirmed',
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Rediriger vers login si non authentifié
          window.location.href = '/login'
          return
        }
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      // Vérifier que la mise à jour a bien été effectuée
      const result = await response.json().catch(() => ({}))
      if (!result.data || result.data.status !== 'confirmed') {
        throw new Error('Booking was not confirmed successfully')
      }

      const selectedDriver = drivers.find(d => d.id === selectedDriverId)
      
      // ✅ SÉQUENCE CORRECTE : WhatsApp s'ouvre APRÈS la confirmation de la mise à jour en DB
      // Ouvrir WhatsApp vers le client avec message de confirmation
      if (selectedDriver) {
        if (!booking.phone) {
          // Avertir l'admin que le client n'a pas de numéro de téléphone
          alert(locale === 'fr' 
            ? '⚠️ Réservation confirmée mais le client n\'a pas fourni de numéro de téléphone. Vous devrez le contacter par email.' 
            : '⚠️ Booking confirmed but the client did not provide a phone number. You will need to contact them by email.')
          onAssigned()
          onClose()
          return
        }
        const clientMessage = locale === 'fr'
          ? `Bonjour ${booking.first_name}, votre course est confirmée ✅.

Votre chauffeur sera : ${selectedDriver.first_name} ${selectedDriver.last_name}.

Il vous contactera à son arrivée.

Merci de votre confiance !`
          : `Hello ${booking.first_name}, your ride is confirmed ✅.

Your driver will be: ${selectedDriver.first_name} ${selectedDriver.last_name}.

He will contact you upon arrival.

Thank you for your trust!`
        
        const whatsappUrl = createWhatsAppUrl(booking.phone, clientMessage)
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      }

      onAssigned()
      onClose()
    } catch (error) {
      console.error('Error assigning driver:', error)
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur lors de l\'assignation' : 'Error assigning driver')
      alert(errorMessage)
    } finally {
      setAssigning(false)
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

  const unavailableDrivers = drivers.filter(
    d => d.is_online && !availableDrivers.find(ad => ad.id === d.id)
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {locale === 'fr' ? 'Assigner un chauffeur' : 'Assign Driver'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'fr'
              ? 'Sélectionnez un chauffeur disponible pour ce créneau'
              : 'Select an available driver for this time slot'}
          </DialogDescription>
        </DialogHeader>

        {/* Booking info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="text-sm font-semibold mb-2">
            {booking.first_name} {booking.last_name}
          </div>
          {booking.scheduled_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatTime(booking.scheduled_date)}
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mt-0.5" />
            <span>{booking.departure_address}</span>
          </div>
        </div>

        {/* Available drivers */}
        <div className="space-y-3">
          <div className="font-semibold text-sm">
            {locale === 'fr' ? 'Chauffeurs disponibles' : 'Available Drivers'} ({availableDrivers.length})
          </div>
          
          {availableDrivers.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              {locale === 'fr'
                ? 'Aucun chauffeur disponible pour ce créneau'
                : 'No drivers available for this time slot'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {availableDrivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriverId(driver.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedDriverId === driver.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">
                        {driver.first_name} {driver.last_name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {driver.phone} {driver.email && `• ${driver.email}`}
                      </div>
                    </div>
                    {selectedDriverId === driver.id ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
                    {locale === 'fr' ? 'Disponible' : 'Available'}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Unavailable drivers (optional, for info) */}
          {unavailableDrivers.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="font-semibold text-sm text-gray-500">
                {locale === 'fr' ? 'Chauffeurs occupés' : 'Busy Drivers'} ({unavailableDrivers.length})
              </div>
              <div className="grid grid-cols-1 gap-2 opacity-60">
                {unavailableDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {driver.first_name} {driver.last_name}
                        </div>
                      </div>
                      <XCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <Badge className="mt-2 bg-gray-100 text-gray-600 border-gray-300">
                      {locale === 'fr' ? 'Occupé' : 'Busy'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button onClick={handleAssign} disabled={!selectedDriverId || assigning}>
            {assigning
              ? locale === 'fr' ? 'Confirmation...' : 'Confirming...'
              : locale === 'fr' ? 'Confirmer & WhatsApp Client' : 'Confirm & WhatsApp Client'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

