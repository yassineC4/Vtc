/// <reference types="google.maps" />

// Déclaration globale pour le namespace google
declare global {
  namespace google {
    namespace maps {
      namespace places {
        interface PlaceResult {
          formatted_address?: string
          geometry?: {
            location: {
              lat(): number
              lng(): number
            }
          }
          [key: string]: any
        }
        
        class Autocomplete {
          constructor(input: HTMLInputElement, options?: any)
          addListener(event: string, callback: () => void): void
          getPlace(): PlaceResult
        }
      }
      
      class Geocoder {
        geocode(request: any, callback: (results: any[], status: string) => void): void
      }
      
      class DistanceMatrixService {
        getDistanceMatrix(request: any, callback: (response: any, status: string) => void): void
      }
      
      enum TravelMode {
        DRIVING
      }
      
      enum UnitSystem {
        METRIC
      }
    }
  }
}

export {}

