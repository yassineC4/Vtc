'use client'

import { useState, useCallback } from 'react'
import { loadGoogleMapsScript } from '@/lib/google-maps'

interface GeolocationState {
  loading: boolean
  error: string | null
  position: { lat: number; lng: number } | null
  address: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
    address: null,
  })

  /**
   * Convertit des coordonnées en adresse avec Google Geocoding API
   */
  const reverseGeocode = useCallback(async (
    lat: number,
    lng: number,
    locale: 'fr' | 'en' | 'ar' = 'fr'
  ): Promise<string | null> => {
    try {
      // Attendre que Google Maps soit chargé
      await loadGoogleMapsScript()

      if (!window.google || !window.google.maps) {
        console.error('Google Maps API not loaded')
        // Fallback : retourner les coordonnées formatées
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }

      // Vérifier si Geocoder est disponible
      if (!window.google.maps.Geocoder) {
        console.error('Geocoder not available in Google Maps API')
        // Fallback : retourner les coordonnées formatées
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }

      const geocoder = new window.google.maps.Geocoder()

      return new Promise((resolve, reject) => {
        // Timeout de sécurité (5 secondes)
        const timeout = setTimeout(() => {
          console.warn('Geocoding timeout, using coordinates as fallback')
          resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }, 5000)

        geocoder.geocode(
          { 
            location: { lat, lng },
            language: locale === 'fr' ? 'fr' : locale === 'ar' ? 'ar' : 'en',
          },
          (results, status) => {
            clearTimeout(timeout)

            if (status === 'OK' && results && results.length > 0) {
              // Retourner la première adresse formatée
              resolve(results[0].formatted_address)
            } else {
              // Gérer les différents types d'erreurs
              console.warn(`Geocoding status: ${status}`)
              
              let errorMessage = 'Unknown error'
              switch (status) {
                case 'ZERO_RESULTS':
                  errorMessage = 'No address found for these coordinates'
                  break
                case 'OVER_QUERY_LIMIT':
                  errorMessage = 'Geocoding quota exceeded'
                  break
                case 'REQUEST_DENIED':
                  errorMessage = 'Geocoding request denied. Check API key permissions'
                  break
                case 'INVALID_REQUEST':
                  errorMessage = 'Invalid geocoding request'
                  break
                default:
                  errorMessage = `Geocoding failed: ${status}`
              }
              
              console.error('Geocoding error:', errorMessage)
              
              // Fallback : retourner les coordonnées formatées au lieu de rejeter
              // Cela permet à l'utilisateur de continuer même si le geocoding échoue
              resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
            }
          }
        )
      })
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback : retourner les coordonnées formatées
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [])

  /**
   * Demande la géolocalisation de l'utilisateur
   */
  const requestLocation = useCallback(async (locale: 'fr' | 'en' | 'ar' = 'fr') => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    // Vérifier si la géolocalisation est supportée
    if (!navigator.geolocation) {
      const error = locale === 'fr'
        ? 'La géolocalisation n\'est pas supportée par votre navigateur'
        : locale === 'ar'
        ? 'الموقع الجغرافي غير مدعوم في متصفحك'
        : 'Geolocation is not supported by your browser'
      setState(prev => ({ ...prev, loading: false, error }))
      return null
    }

    return new Promise<{ lat: number; lng: number; address: string } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          setState(prev => ({
            ...prev,
            position: { lat: latitude, lng: longitude },
            loading: false,
          }))

          // Convertir les coordonnées en adresse
          try {
            const address = await reverseGeocode(latitude, longitude, locale)
            
            // Si l'adresse est juste des coordonnées, c'est un fallback
            const isCoordinatesFallback = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address || '')
            
            setState(prev => ({
              ...prev,
              address: address || null,
            }))

            if (address) {
              // Si c'est juste des coordonnées, on peut afficher un avertissement mais continuer
              if (isCoordinatesFallback) {
                console.warn('Using coordinates as address (geocoding failed)')
                // On ne met pas d'erreur dans l'état, mais on retourne quand même l'adresse (coordonnées)
                // L'utilisateur peut toujours utiliser les coordonnées pour chercher une adresse
              }
              
              resolve({ lat: latitude, lng: longitude, address })
            } else {
              // Ce cas ne devrait normalement pas arriver car reverseGeocode retourne toujours quelque chose maintenant
              const error = locale === 'fr'
                ? 'Impossible de récupérer la position'
                : locale === 'ar'
                ? 'تعذر الحصول على الموقع'
                : 'Unable to retrieve position'
              setState(prev => ({ ...prev, error }))
              resolve(null)
            }
          } catch (error) {
            console.error('Geocoding error:', error)
            // En cas d'erreur, utiliser les coordonnées comme fallback
            const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setState(prev => ({
              ...prev,
              address: fallbackAddress,
            }))
            resolve({ lat: latitude, lng: longitude, address: fallbackAddress })
          }
        },
        (error) => {
          let errorMessage: string
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = locale === 'fr'
                ? 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position.'
                : locale === 'ar'
                ? 'تم رفض إذن الموقع الجغرافي. يرجى السماح بالوصول إلى موقعك.'
                : 'Geolocation permission denied. Please allow access to your location.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = locale === 'fr'
                ? 'Position indisponible. Vérifiez votre connexion GPS.'
                : locale === 'ar'
                ? 'الموقع غير متاح. يرجى التحقق من اتصال GPS الخاص بك.'
                : 'Position unavailable. Check your GPS connection.'
              break
            case error.TIMEOUT:
              errorMessage = locale === 'fr'
                ? 'Timeout lors de la récupération de la position'
                : locale === 'ar'
                ? 'انتهت مهلة الحصول على الموقع'
                : 'Timeout while retrieving position'
              break
            default:
              errorMessage = locale === 'fr'
                ? 'Erreur lors de la géolocalisation'
                : locale === 'ar'
                ? 'خطأ أثناء الحصول على الموقع الجغرافي'
                : 'Error during geolocation'
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }))
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }, [reverseGeocode])

  /**
   * Réinitialise l'état de la géolocalisation
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      position: null,
      address: null,
    })
  }, [])

  return {
    ...state,
    requestLocation,
    reset,
  }
}

