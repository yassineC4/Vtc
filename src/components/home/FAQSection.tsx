'use client'

import { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function FAQSection() {
  const { locale } = useLocale()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: locale === 'fr' 
        ? 'Comment réserver ?' 
        : locale === 'ar' 
        ? 'كيف أحجز؟' 
        : 'How do I book?',
      answer: locale === 'fr'
        ? 'Utilisez notre calculateur en ligne pour obtenir un prix estimé, puis réservez directement via WhatsApp avec un message pré-rempli.'
        : locale === 'ar'
        ? 'استخدم حاسبتنا عبر الإنترنت للحصول على سعر تقديري، ثم احجز مباشرة عبر واتساب مع رسالة مملوءة مسبقاً.'
        : 'Use our online calculator to get an estimated price, then book directly via WhatsApp with a pre-filled message.',
    },
    {
      question: locale === 'fr'
        ? 'Quels moyens de paiement acceptez-vous ?'
        : locale === 'ar'
        ? 'ما هي طرق الدفع التي تقبلونها؟'
        : 'What payments do you accept?',
      answer: locale === 'fr'
        ? 'Nous acceptons les paiements en espèces et par carte bancaire.'
        : locale === 'ar'
        ? 'نقبل المدفوعات نقداً وبالبطاقة المصرفية.'
        : 'We accept cash and card payments.',
    },
    {
      question: locale === 'fr'
        ? 'Les prix sont-ils fixes ? Qu\'est-ce qui est inclus ?'
        : locale === 'ar'
        ? 'هل الأسعار ثابتة؟ ما المدرج؟'
        : 'Are prices fixed? What\'s included?',
      answer: locale === 'fr'
        ? 'Oui, le prix affiché est fixe et inclut tous les taxes et péages. L\'attente est incluse : 45 min pour les aéroports, 20 min pour les gares-hôtels.'
        : locale === 'ar'
        ? 'نعم، السعر المعروض ثابت ويشمل جميع الضرائب والرسوم. الانتظار مدرج: 45 دقيقة للمطارات، 20 دقيقة للمحطات والفنادق.'
        : 'Yes, the displayed price is fixed and includes all taxes and tolls. Waiting is included: 45 min for airports, 20 min for stations-hotels.',
    },
    {
      question: locale === 'fr'
        ? 'Que se passe-t-il si mon vol ou train est retardé ?'
        : locale === 'ar'
        ? 'ماذا يحدث إذا تأخرت رحلتي أو قطاري؟'
        : 'What if my flight or train is delayed?',
      answer: locale === 'fr'
        ? 'Nous suivons les vols en temps réel. En cas de retard, nous ajustons automatiquement l\'heure de prise en charge sans frais supplémentaires.'
        : locale === 'ar'
        ? 'نتتبع الرحلات في الوقت الفعلي. في حالة التأخير، نعدل تلقائياً وقت الاستلام دون رسوم إضافية.'
        : 'We track flights in real-time. In case of delay, we automatically adjust the pickup time at no extra charge.',
    },
    {
      question: locale === 'fr'
        ? 'Combien de temps attendez-vous aux arrivées/gares ?'
        : locale === 'ar'
        ? 'كم من الوقت تنتظرون في المطارات/المحطات؟'
        : 'How long do you wait at arrivals/stations?',
      answer: locale === 'fr'
        ? 'Nous attendons 45 minutes pour les aéroports et 20 minutes pour les gares et hôtels, sans frais supplémentaires.'
        : locale === 'ar'
        ? 'ننتظر 45 دقيقة للمطارات و 20 دقيقة للمحطات والفنادق، دون رسوم إضافية.'
        : 'We wait 45 minutes for airports and 20 minutes for stations and hotels, at no extra charge.',
    },
    {
      question: locale === 'fr'
        ? 'Puis-je changer ou annuler ?'
        : locale === 'ar'
        ? 'هل يمكنني التغيير أو الإلغاء؟'
        : 'Can I change or cancel?',
      answer: locale === 'fr'
        ? 'Oui, vous pouvez modifier ou annuler votre réservation. Contactez-nous via WhatsApp au moins 2 heures avant le départ.'
        : locale === 'ar'
        ? 'نعم، يمكنك تعديل أو إلغاء حجزك. اتصل بنا عبر واتساب قبل ساعتين على الأقل من المغادرة.'
        : 'Yes, you can modify or cancel your booking. Contact us via WhatsApp at least 2 hours before departure.',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' 
              ? 'Questions Fréquemment Posées' 
              : locale === 'ar' 
              ? 'الأسئلة الشائعة' 
              : 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600">
            {locale === 'fr'
              ? 'Réponses concises pour les réservations de chauffeur premium en France.'
              : locale === 'ar'
              ? 'إجابات موجزة لحجوزات السائق المميز في فرنسا.'
              : 'Concise answers for premium chauffeur bookings across France.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-colors duration-300 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-primary/5 rounded-xl border-2 border-primary/20">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {locale === 'fr' ? 'Besoin d\'aide ?' : locale === 'ar' ? 'تحتاج مساعدة؟' : 'Need help?'}
          </p>
          <p className="text-gray-600">
            {locale === 'fr'
              ? '24/7 pour les réservations • Réponses en quelques minutes'
              : locale === 'ar'
              ? '24/7 للحجوزات • ردود في دقائق'
              : '24/7 for bookings • Replies in minutes'}
          </p>
        </div>
      </div>
    </section>
  )
}
