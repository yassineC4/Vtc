import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout spécifique pour la page de login
  // Si l'utilisateur est déjà connecté, le rediriger vers /admin
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/admin')
  }

  // Pas de protection d'authentification pour la page de login
  return <>{children}</>
}
