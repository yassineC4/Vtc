'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { loadGoogleMapsScript, initAutocomplete } from '@/lib/google-maps'

export function useGoogleMapsAutocomplete(
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
) {
  const [isLoaded, setIsLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const isInitializedRef = useRef(false)

  // Utiliser useCallback pour stabiliser la fonction
  const handlePlaceSelected = useCallback(
    (place: google.maps.places.PlaceResult) => {
      onPlaceSelected(place)
    },
    [onPlaceSelected]
  )

  useEffect(() => {
    let isMounted = true

    loadGoogleMapsScript()
      .then(() => {
        if (isMounted) {
          setIsLoaded(true)
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error)
        // Afficher une alerte pour informer l'utilisateur si la clé API est manquante
        if (error.message?.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined')) {
          const isProduction = window.location.hostname !== 'localhost'
          if (isProduction) {
            alert('Erreur: Clé API Google Maps manquante. Veuillez configurer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans les variables d\'environnement de Vercel (Settings > Environment Variables), puis redéployez.')
          } else {
            alert('Erreur: Clé API Google Maps manquante. Veuillez configurer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans votre fichier .env.local')
          }
        }
        if (isMounted) {
          setIsLoaded(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (
      isLoaded &&
      inputRef.current &&
      !autocompleteRef.current &&
      !isInitializedRef.current
    ) {
      // Fonction pour initialiser Autocomplete
      const tryInit = () => {
        if (inputRef.current && !autocompleteRef.current && !isInitializedRef.current) {
          const autocomplete = initAutocomplete(inputRef.current, handlePlaceSelected)
          if (autocomplete) {
            autocompleteRef.current = autocomplete
            isInitializedRef.current = true
            return true
          }
        }
        return false
      }

      // Essayer d'initialiser immédiatement
      if (!tryInit()) {
        // Si cela échoue, réessayer après un court délai (Places peut prendre du temps)
        const retryTimeout = setTimeout(() => {
          tryInit()
        }, 300)

        return () => clearTimeout(retryTimeout)
      }
    }
  }, [isLoaded, handlePlaceSelected])

  return { inputRef, isLoaded }
}

