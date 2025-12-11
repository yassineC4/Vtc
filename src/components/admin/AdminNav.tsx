'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getTranslations, type Locale } from '@/lib/i18n'
import { Settings, MessageSquare, LogOut, MapPin, Users, Calendar, Car } from 'lucide-react'

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
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <Settings className="h-4 w-4" />
              {t.admin.settings}
            </Link>
            <Link
              href="/admin/reviews"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin/reviews' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              {t.admin.reviews}
            </Link>
            <Link
              href="/admin/destinations"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin/destinations' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <MapPin className="h-4 w-4" />
              {t.admin.destinations}
            </Link>
            <Link
              href="/admin/drivers"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin/drivers' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <Users className="h-4 w-4" />
              {locale === 'fr' ? 'Chauffeurs' : 'Drivers'}
            </Link>
            <Link
              href="/admin/bookings"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin/bookings' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <Car className="h-4 w-4" />
              {locale === 'fr' ? 'Réservations' : 'Bookings'}
            </Link>
            <Link
              href="/admin/planning"
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                pathname === '/admin/planning' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <Calendar className="h-4 w-4" />
              {locale === 'fr' ? 'Planning' : 'Planning'}
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

