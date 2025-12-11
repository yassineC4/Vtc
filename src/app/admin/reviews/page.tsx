import { ReviewsList } from '@/components/admin/ReviewsList'
import { defaultLocale } from '@/lib/i18n'

export default function AdminReviewsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestion des Avis</h1>
      <ReviewsList locale={defaultLocale} />
    </div>
  )
}

