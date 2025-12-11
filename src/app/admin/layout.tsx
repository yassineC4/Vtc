import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin/AdminNav'
import { defaultLocale } from '@/lib/i18n'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <AdminNav locale={defaultLocale} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
