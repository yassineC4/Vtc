import { PlanningView } from '@/components/admin/PlanningView'
import { defaultLocale } from '@/lib/i18n'

export default function AdminPlanningPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {defaultLocale === 'fr' ? 'Planning Journalier' : 'Daily Planning'}
      </h1>
      <PlanningView locale={defaultLocale} />
    </div>
  )
}



