declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

// Singleton pour éviter le chargement multiple du script
let loadingPromise: Promise<void> | null = null
let isScriptLoaded = false

/**
 * Vérifie si Google Maps Places API est disponible
 */
function isPlacesAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.google !== undefined &&
    window.google.maps !== undefined &&
    window.google.maps.places !== undefined &&
    window.google.maps.places.Autocomplete !== undefined
  )
}

export function loadGoogleMapsScript(): Promise<void> {
  // Vérifier que nous sommes dans le navigateur
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('loadGoogleMapsScript can only be called in the browser'))
  }

  // Si déjà chargé, retourner une Promise résolue
  if (isPlacesAvailable()) {
    return Promise.resolve()
  }

  // Si déjà en cours de chargement, retourner la même Promise
  if (loadingPromise) {
    return loadingPromise
  }

  // Vérifier la clé API
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    const error = new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined. Please check your .env.local file.')
    console.error('Google Maps Error:', error.message)
    return Promise.reject(error)
  }

  // Vérifier si le script existe déjà dans le DOM
  const existingScript = document.querySelector(
    `script[src*="maps.googleapis.com/maps/api/js"]`
  ) as HTMLScriptElement

  if (existingScript) {
    // Script existe mais pas encore chargé, attendre son chargement
    loadingPromise = new Promise((resolve, reject) => {
      const checkLoaded = setInterval(() => {
        if (isPlacesAvailable()) {
          clearInterval(checkLoaded)
          isScriptLoaded = true
          loadingPromise = null
          resolve()
        }
      }, 100)

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        clearInterval(checkLoaded)
        if (isPlacesAvailable()) {
          isScriptLoaded = true
          loadingPromise = null
          resolve()
        } else {
          loadingPromise = null
          const error = new Error('Google Maps Places library failed to load after 10 seconds. Please check your API key and console for errors.')
          console.error('Google Maps Error:', error.message)
          reject(error)
        }
      }, 10000)
    })
    return loadingPromise
  }

  // Créer et charger le script
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.id = 'google-maps-script'

    script.onload = () => {
      console.log('Google Maps script loaded, waiting for Places API...')
      
      // Attendre que Places soit disponible (peut prendre un moment après le chargement du script)
      const checkPlaces = setInterval(() => {
        if (isPlacesAvailable()) {
          clearInterval(checkPlaces)
          clearTimeout(timeout)
          isScriptLoaded = true
          loadingPromise = null
          console.log('Google Maps Places API is ready!')
          resolve()
        }
      }, 50)

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        clearInterval(checkPlaces)
        if (isPlacesAvailable()) {
          isScriptLoaded = true
          loadingPromise = null
          resolve()
        } else {
          loadingPromise = null
          const error = new Error('Google Maps Places library failed to load after 5 seconds. Please check: 1) Your API key is valid, 2) Places API is enabled in Google Cloud Console, 3) No browser console errors.')
          console.error('Google Maps Error:', error.message)
          console.error('Check if window.google exists:', typeof window.google)
          console.error('Check if window.google.maps exists:', typeof window.google?.maps)
          console.error('Check if window.google.maps.places exists:', typeof window.google?.maps?.places)
          reject(error)
        }
      }, 8000)
    }

    script.onerror = (error) => {
      loadingPromise = null
      const err = new Error(`Failed to load Google Maps script. Possible causes: 1) Invalid API key, 2) Network error, 3) API restrictions. Check browser console for details.`)
      console.error('Google Maps Script Error:', error)
      console.error('Script URL that failed:', script.src.replace(apiKey, 'YOUR_API_KEY'))
      reject(err)
    }

    document.head.appendChild(script)
    console.log('Loading Google Maps script...')
  })

  return loadingPromise
}

export function initAutocomplete(
  input: HTMLInputElement,
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
) {
  // Vérifier que Google Maps et Places sont bien disponibles
  if (!isPlacesAvailable()) {
    console.warn('Google Maps Places API not available yet')
    return null
  }

  try {
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: ['fr', 'it', 'es', 'ch'] }, // France, Italie, Espagne, Suisse
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry) {
        onPlaceSelected(place)
      }
    })

    return autocomplete
  } catch (error) {
    console.error('Error initializing Autocomplete:', error)
    return null
  }
}

export async function calculateRoute(
  origin: string,
  destination: string
): Promise<{ distance: number; duration: number } | null> {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    const error = new Error('Google Maps API not loaded')
    console.error('❌ SAFARI DEBUG - Google Maps not available:', {
      hasWindow: typeof window !== 'undefined',
      hasGoogle: typeof window !== 'undefined' && !!window.google,
      hasMaps: typeof window !== 'undefined' && !!window.google?.maps,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    })
    throw error
  }

  return new Promise((resolve, reject) => {
    try {
      const service = new window.google.maps.DistanceMatrixService()

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          try {
            if (status === 'OK' && response) {
              const element = response.rows[0]?.elements[0]
              if (element && element.status === 'OK') {
                resolve({
                  distance: element.distance.value, // en mètres
                  duration: element.duration.value, // en secondes
                })
              } else {
                const errorMsg = element?.status || 'Unknown element status'
                console.error('❌ SAFARI DEBUG - Route calculation failed:', {
                  status,
                  elementStatus: errorMsg,
                  response,
                  origin,
                  destination,
                })
                reject(new Error(`Route calculation failed: ${errorMsg}`))
              }
            } else {
              console.error('❌ SAFARI DEBUG - Distance Matrix API error:', {
                status,
                origin,
                destination,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
              })
              reject(new Error(`Distance Matrix API error: ${status}`))
            }
          } catch (callbackError) {
            console.error('❌ SAFARI DEBUG - Error in DistanceMatrix callback:', callbackError)
            reject(callbackError instanceof Error ? callbackError : new Error('Unknown error in callback'))
          }
        }
      )
    } catch (initError) {
      console.error('❌ SAFARI DEBUG - Error initializing DistanceMatrixService:', {
        error: initError instanceof Error ? initError.message : String(initError),
        stack: initError instanceof Error ? initError.stack : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      })
      reject(initError instanceof Error ? initError : new Error('Failed to initialize DistanceMatrixService'))
    }
  })
}

/**
 * ✅ Calcul batch optimisé : Calcule les distances et durées pour plusieurs destinations en une seule requête API
 * @param origin - Adresse de départ
 * @param destinations - Tableau d'adresses de destinations
 * @returns Promise avec un tableau de résultats (distance en mètres, duration en secondes) dans le même ordre que destinations
 */
export async function calculateDistanceMatrixBatch(
  origin: string,
  destinations: string[]
): Promise<Array<{ distance: number; duration: number } | null>> {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded')
  }

  if (destinations.length === 0) {
    return []
  }

  return new Promise((resolve, reject) => {
    try {
      const service = new window.google.maps.DistanceMatrixService()

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: destinations, // ✅ Batch : toutes les destinations en une seule requête
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          try {
            if (status === 'OK' && response && response.rows[0]) {
              const row = response.rows[0]
              // ✅ Mapper chaque élément de la réponse aux destinations
              const results = row.elements.map((element) => {
                if (element.status === 'OK' && element.distance && element.duration) {
                  return {
                    distance: element.distance.value, // en mètres
                    duration: element.duration.value, // en secondes
                  }
                } else {
                  // Si une destination a échoué, retourner null pour cette destination
                  console.warn('Distance Matrix element status:', element.status)
                  return null
                }
              })
              resolve(results)
            } else {
              console.error('Distance Matrix API batch error:', { status, origin, destinationsCount: destinations.length })
              reject(new Error(`Distance Matrix API batch error: ${status}`))
            }
          } catch (callbackError) {
            console.error('Error in DistanceMatrix batch callback:', callbackError)
            reject(callbackError instanceof Error ? callbackError : new Error('Unknown error in batch callback'))
          }
        }
      )
    } catch (initError) {
      console.error('Error initializing DistanceMatrixService for batch:', initError)
      reject(initError instanceof Error ? initError : new Error('Failed to initialize DistanceMatrixService'))
    }
  })
}

