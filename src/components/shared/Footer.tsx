'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export function Footer() {
  const { locale } = useLocale()
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Colonne 1: VTC */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">VTC</h3>
            <p className="text-gray-400 text-sm">
              {locale === 'fr'
                ? 'Service de chauffeur premium en France.'
                : locale === 'ar'
                ? 'خدمة سائق مميزة في فرنسا.'
                : 'Premium chauffeur service across France.'}
            </p>
          </div>

          {/* Colonne 2: Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {locale === 'fr' ? 'Services' : locale === 'ar' ? 'خدمات' : 'Services'}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => {
                    const services = document.getElementById('services')
                    if (services) {
                      services.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Transferts aéroport' : locale === 'ar' ? 'نقل المطار' : 'Airport transfers'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const services = document.getElementById('services')
                    if (services) {
                      services.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Affaires' : locale === 'ar' ? 'أعمال' : 'Business'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const services = document.getElementById('services')
                    if (services) {
                      services.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Événements' : locale === 'ar' ? 'فعاليات' : 'Events'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const services = document.getElementById('services')
                    if (services) {
                      services.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Longue distance' : locale === 'ar' ? 'مسافات طويلة' : 'Long distance'}
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {locale === 'fr' ? 'Légal' : locale === 'ar' ? 'قانوني' : 'Legal'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {locale === 'fr' ? 'Mentions légales' : locale === 'ar' ? 'إشعارات قانونية' : 'Legal notice'}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {locale === 'fr' ? 'Confidentialité' : locale === 'ar' ? 'الخصوصية' : 'Privacy'}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {locale === 'fr' ? 'Conditions' : locale === 'ar' ? 'الشروط' : 'Terms'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {locale === 'fr' ? 'Contact' : locale === 'ar' ? 'اتصل بنا' : 'Contact'}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@vtc.fr"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>contact@vtc.fr</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+33123456789"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>+33 1 23 45 67 89</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/33123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} VTC. {locale === 'fr' ? 'Tous droits réservés' : locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
            </p>
            <button
              onClick={scrollToTop}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              {locale === 'fr' ? 'Retour en haut' : locale === 'ar' ? 'العودة للأعلى' : 'Back to top'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
