'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getTranslations, type Locale } from '@/lib/i18n'
import { LogOut, Calendar } from 'lucide-react'

interface AdminNavProps {
  locale: Locale
}

export function AdminNav({ locale }: AdminNavProps) {
  const t = getTranslations(locale)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/planning"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin/planning' || pathname === '/admin/bookings' || pathname === '/admin'
                  ? 'bg-primary text-primary-foreground' 
                  : ''
              }`}
            >
              <Calendar className="h-4 w-4" />
              {locale === 'fr' ? 'Réservations' : 'Bookings'}
            </Link>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t.admin.logout}
          </Button>
        </div>
      </div>
    </nav>
  )
}

