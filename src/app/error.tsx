'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Logger l'erreur pour le debugging
    console.error('Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Une erreur s'est produite
        </h2>
        <p className="text-gray-600 mb-6">
          Désolé, quelque chose s'est mal passé. Veuillez réessayer.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 break-words">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary/90"
          >
            Réessayer
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}

