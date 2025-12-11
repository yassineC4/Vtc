'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateRoute } from '@/lib/google-maps'
import { RideCalculation } from '@/types'

export function useRideCalculator() {
  const [pricePerKm, setPricePerKm] = useState<number>(1.5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Charger le prix au kilomètre depuis Supabase
    const loadPricePerKm = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'price_per_km')
          .single()

        if (error) {
          throw error
        }

        if (data) {
          // @ts-ignore - Supabase typing issue
          const value = data.value as number
          if (typeof value === 'number') {
            setPricePerKm(value)
          }
        }
      } catch (error) {
        console.error('Error loading price per km:', error)
        // En cas d'erreur, on garde la valeur par défaut (1.5)
      }
    }

    loadPricePerKm()
  }, [])

  const calculateRide = async (
    origin: string,
    destination: string,
    retries = 3
  ): Promise<RideCalculation | null> => {
    setLoading(true)
    setError(null)

    try {
      const route = await calculateRoute(origin, destination)
      if (!route) {
        throw new Error('Impossible de calculer l\'itinéraire')
      }

      const distanceInKm = route.distance / 1000
      let price = distanceInKm * pricePerKm

      // Tarif minimum de 15€ pour toute course
      const MINIMUM_PRICE = 15
      if (price < MINIMUM_PRICE) {
        price = MINIMUM_PRICE
      }

      // Arrondir à 2 décimales
      price = Math.round(price * 100) / 100

      setRetryCount(0)
      return {
        distance: route.distance,
        duration: route.duration,
        price,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      
      // Retry logic
      if (retries > 0 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setRetryCount(prev => prev + 1)
        return calculateRide(origin, destination, retries - 1)
      }
      
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    calculateRide,
    pricePerKm,
    loading,
    error,
  }
}

