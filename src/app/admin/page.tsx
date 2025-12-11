import { SettingsForm } from '@/components/admin/SettingsForm'
import { defaultLocale } from '@/lib/i18n'

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuration</h1>
      <SettingsForm locale={defaultLocale} />
    </div>
  )
}

