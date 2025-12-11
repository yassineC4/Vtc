'use client'

import Link from 'next/link'
import { FileText, Home, Settings, Phone, Mail, Calendar, ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { locale } = useLocale()

  const currentYear = new Date().getFullYear()

  const scrollToReservation = () => {
    const reservationSection = document.getElementById('ride-calculator')
    if (reservationSection) {
      reservationSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const links = {
    fr: {
      home: 'Accueil',
      legal: 'Mentions Légales',
      admin: 'Administration',
      contact: 'Contact',
      phone: 'Téléphone',
      email: 'Email',
      rights: 'Tous droits réservés',
      bookNow: 'Réserver maintenant',
      quickReservation: 'Réservation rapide',
      services: 'Nos Services',
    },
    en: {
      home: 'Home',
      legal: 'Legal Notices',
      admin: 'Administration',
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      rights: 'All rights reserved',
      bookNow: 'Book Now',
      quickReservation: 'Quick Reservation',
      services: 'Our Services',
    },
    ar: {
      home: 'الرئيسية',
      legal: 'الإشعارات القانونية',
      admin: 'الإدارة',
      contact: 'اتصل بنا',
      phone: 'هاتف',
      email: 'بريد إلكتروني',
      rights: 'جميع الحقوق محفوظة',
      bookNow: 'احجز الآن',
      quickReservation: 'حجز سريع',
      services: 'خدماتنا',
    },
  }

  const t = links[locale]

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      {/* CTA Principal en haut du footer */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {locale === 'fr'
                ? 'Prêt à réserver votre course ?'
                : locale === 'ar'
                ? 'هل أنت مستعد لحجز رحلتك؟'
                : 'Ready to book your ride?'}
            </h3>
            <p className="text-lg text-indigo-100 mb-6">
              {locale === 'fr'
                ? 'Calculez votre prix en quelques secondes et réservez en un clic'
                : locale === 'ar'
                ? 'احسب سعرك في ثوانٍ واحجز بنقرة واحدة'
                : 'Calculate your price in seconds and book with one click'}
            </p>
            <Button
              onClick={scrollToReservation}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                {t.bookNow}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Colonne 1: Navigation */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {locale === 'fr' ? 'Navigation' : locale === 'ar' ? 'التنقل' : 'Navigation'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <Home className="w-4 h-4" />
                  {t.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <FileText className="w-4 h-4" />
                  {t.legal}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <Settings className="w-4 h-4" />
                  {t.admin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 2: Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t.contact}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:0033695297192"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>+33 6 95 29 71 92</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/33695297192"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:[VOTRE EMAIL]"
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>[VOTRE EMAIL]</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t.services}</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={scrollToReservation}
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200 text-left w-full group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  <span>
                    {locale === 'fr'
                      ? 'Transport VTC Premium'
                      : locale === 'ar'
                      ? 'نقل VTC المميز'
                      : 'Premium VTC Transport'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const otherServices = document.getElementById('other-services')
                    if (otherServices) {
                      otherServices.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200 text-left w-full group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  <span>
                    {locale === 'fr'
                      ? 'Chauffeur à disposition'
                      : locale === 'ar'
                      ? 'سائق تحت الطلب'
                      : 'Chauffeur on standby'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const destinations = document.getElementById('popular-destinations')
                    if (destinations) {
                      destinations.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="flex items-center gap-2 hover:text-primary transition-colors duration-200 text-left w-full group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  <span>
                    {locale === 'fr'
                      ? 'Destinations populaires'
                      : locale === 'ar'
                      ? 'الوجهات الشعبية'
                      : 'Popular destinations'}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Informations */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {locale === 'fr' ? 'Informations' : locale === 'ar' ? 'معلومات' : 'Information'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span>
                  {locale === 'fr'
                    ? 'Service disponible 24/7'
                    : locale === 'ar'
                    ? 'خدمة متاحة على مدار الساعة'
                    : 'Service available 24/7'}
                </span>
              </li>
              <li>
                <span>
                  {locale === 'fr'
                    ? 'Réservation en ligne'
                    : locale === 'ar'
                    ? 'حجز عبر الإنترنت'
                    : 'Online booking'}
                </span>
              </li>
              <li>
                <span>
                  {locale === 'fr'
                    ? 'Véhicules haut de gamme'
                    : locale === 'ar'
                    ? 'مركبات فاخرة'
                    : 'Premium vehicles'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} [VOTRE NOM DE SOCIÉTÉ]. {t.rights}
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/legal"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                {t.legal}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

