'use client'

import Link from 'next/link'
import { FileText, Phone, Mail, Calendar, ArrowRight } from 'lucide-react'
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
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'fr'
                ? 'Prêt pour votre prochaine course ?'
                : locale === 'ar'
                ? 'هل أنت مستعد لرحلتك القادمة؟'
                : 'Ready for your next ride?'}
            </h3>
            <p className="text-lg text-indigo-100 mb-6">
              {locale === 'fr'
                ? 'Prix fixe affiché à l\'avance. Disponibilité 24/7. Confirmez en quelques secondes.'
                : locale === 'ar'
                ? 'سعر ثابت معروض مسبقاً. متاح 24/7. أكد في ثوانٍ.'
                : 'Fixed fare shown up front. 24/7 availability. Confirm in seconds.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Button
                onClick={scrollToReservation}
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" />
                  {locale === 'fr' ? 'Estimer le prix' : locale === 'ar' ? 'قدر السعر' : 'Estimate the price'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
            <p className="text-sm text-indigo-200">
              {locale === 'fr'
                ? 'Tous les taxes et péages inclus. Attente incluse : 45 min aéroport / 20 min gare-hôtel. Confirmation finale avant réservation.'
                : locale === 'ar'
                ? 'جميع الضرائب والرسوم مدرجة. الانتظار مدرج: 45 دقيقة للمطار / 20 دقيقة للمحطة-الفندق. تأكيد نهائي قبل الحجز.'
                : 'All taxes and tolls included. Waiting included: 45 min airport / 20 min station-hotel. Final confirmation before booking.'}
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-indigo-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold">4.8/5</span>
                <span>{locale === 'fr' ? 'note moyenne' : locale === 'ar' ? 'متوسط التقييم' : 'average rating'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">24/7</span>
                <span>{locale === 'fr' ? 'réservations' : locale === 'ar' ? 'حجوزات' : 'bookings'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">✓</span>
                <span>{locale === 'fr' ? 'Chauffeurs vérifiés' : locale === 'ar' ? 'سائقون موثقون' : 'Verified chauffeurs'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">✈️</span>
                <span>{locale === 'fr' ? 'Suivi des vols inclus' : locale === 'ar' ? 'تتبع الرحلات مدرج' : 'Flight tracking included'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Colonne 1: VTC */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">
              {locale === 'fr' ? 'VTC' : locale === 'ar' ? 'VTC' : 'VTC'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
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
                  onClick={scrollToReservation}
                  className="text-gray-400 hover:text-primary transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Transferts aéroport' : locale === 'ar' ? 'نقل المطار' : 'Airport transfers'}
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
                  className="text-gray-400 hover:text-primary transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Affaires' : locale === 'ar' ? 'أعمال' : 'Business'}
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
                  className="text-gray-400 hover:text-primary transition-colors duration-200 text-left"
                >
                  {locale === 'fr' ? 'Événements' : locale === 'ar' ? 'فعاليات' : 'Events'}
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToReservation}
                  className="text-gray-400 hover:text-primary transition-colors duration-200 text-left"
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
                  className="text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  {locale === 'fr' ? 'Mentions légales' : locale === 'ar' ? 'إشعارات قانونية' : 'Legal notice'}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  {locale === 'fr' ? 'Confidentialité' : locale === 'ar' ? 'الخصوصية' : 'Privacy'}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-primary transition-colors duration-200"
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
                  className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>contact@vtc.fr</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+33695297192"
                  className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors duration-200"
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
                  className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors duration-200"
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

