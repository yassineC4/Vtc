// Layout spécifique pour la page de login
// Pas de vérification de session ici pour éviter les boucles de redirection
// La vérification se fait côté client dans la page de login
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
