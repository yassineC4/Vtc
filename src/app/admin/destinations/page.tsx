import { DestinationsList } from '@/components/admin/DestinationsList'
import { defaultLocale } from '@/lib/i18n'

export default function AdminDestinationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {defaultLocale === 'fr' ? 'Gestion des Destinations' : 'Destinations Management'}
      </h1>
      <DestinationsList locale={defaultLocale} />
    </div>
  )
}


