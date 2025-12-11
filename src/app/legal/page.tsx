import { Metadata } from 'next'
import { LegalMentions } from '@/components/shared/LegalMentions'
import { Footer } from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: 'Mentions Légales & Confidentialité',
  description: 'Mentions légales, politique de confidentialité et gestion des cookies de notre service VTC',
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalPage() {
  return (
    <>
      <LegalMentions />
      <Footer />
    </>
  )
}

