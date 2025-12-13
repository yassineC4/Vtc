import { DriversList } from '@/components/admin/DriversList'
import { defaultLocale } from '@/lib/i18n'

export default function AdminDriversPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {defaultLocale === 'fr' ? 'Gestion des Chauffeurs' : 'Drivers Management'}
      </h1>
      <DriversList locale={defaultLocale} />
    </div>
  )
}


