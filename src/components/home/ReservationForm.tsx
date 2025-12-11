'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/contexts/LocaleContext'
import { getTranslations } from '@/lib/i18n'
import { User, Users, Baby, X, Check, CreditCard, Banknote, Mail, Phone, Info } from 'lucide-react'

interface ReservationFormProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: ReservationData) => void
}

export interface ReservationData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  numberOfPassengers: number
  babySeat: boolean
  paymentMethod: 'cash' | 'card'
}

export function ReservationForm({ open, onClose, onConfirm }: ReservationFormProps) {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [numberOfPassengers, setNumberOfPassengers] = useState(1)
  const [babySeat, setBabySeat] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) {
      newErrors.firstName = locale === 'fr' 
        ? 'Le prénom est requis' 
        : locale === 'ar'
        ? 'الاسم الأول مطلوب'
        : 'First name is required'
    }

    if (!lastName.trim()) {
      newErrors.lastName = locale === 'fr'
        ? 'Le nom est requis'
        : locale === 'ar'
        ? 'اسم العائلة مطلوب'
        : 'Last name is required'
    }

    if (numberOfPassengers < 1 || numberOfPassengers > 8) {
      newErrors.numberOfPassengers = locale === 'fr'
        ? 'Le nombre de passagers doit être entre 1 et 8'
        : locale === 'ar'
        ? 'عدد الركاب يجب أن يكون بين 1 و 8'
        : 'Number of passengers must be between 1 and 8'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      onConfirm({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        numberOfPassengers,
        babySeat,
        paymentMethod,
      })
      // Réinitialiser le formulaire
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setNumberOfPassengers(1)
      setBabySeat(false)
      setPaymentMethod('cash')
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-4 sm:p-6 md:p-8">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            {locale === 'fr'
              ? 'Informations de réservation'
              : locale === 'ar'
              ? 'معلومات الحجز'
              : 'Reservation Information'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          {/* Prénom */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-base font-semibold">
              {locale === 'fr' ? 'Prénom' : locale === 'ar' ? 'الاسم الأول' : 'First name'} *
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: '' })
                }
              }}
              placeholder={locale === 'fr' ? 'Votre prénom' : locale === 'ar' ? 'اسمك الأول' : 'Your first name'}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <X className="w-4 h-4" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-base font-semibold">
              {locale === 'fr' ? 'Nom' : locale === 'ar' ? 'اسم العائلة' : 'Last name'} *
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: '' })
                }
              }}
              placeholder={locale === 'fr' ? 'Votre nom' : locale === 'ar' ? 'اسم عائلتك' : 'Your last name'}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <X className="w-4 h-4" />
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {locale === 'fr' ? 'Email' : locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={locale === 'fr' ? 'votre@email.com' : locale === 'ar' ? 'بريدك@الإلكتروني.com' : 'your@email.com'}
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              {locale === 'fr' ? 'Téléphone' : locale === 'ar' ? 'الهاتف' : 'Phone'}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={locale === 'fr' ? '06 12 34 56 78' : locale === 'ar' ? '06 12 34 56 78' : '06 12 34 56 78'}
            />
          </div>

          {/* Nombre de passagers */}
          <div className="space-y-2">
            <Label htmlFor="passengers" className="text-base font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {locale === 'fr' ? 'Nombre de passagers' : locale === 'ar' ? 'عدد الركاب' : 'Number of passengers'} *
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (numberOfPassengers > 1) {
                    setNumberOfPassengers(numberOfPassengers - 1)
                    if (errors.numberOfPassengers) {
                      setErrors({ ...errors, numberOfPassengers: '' })
                    }
                  }
                }}
                disabled={numberOfPassengers <= 1}
                className="h-10 w-10 rounded-lg"
              >
                -
              </Button>
              <Input
                id="passengers"
                type="number"
                min="1"
                max="8"
                value={numberOfPassengers}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  if (value >= 1 && value <= 8) {
                    setNumberOfPassengers(value)
                    if (errors.numberOfPassengers) {
                      setErrors({ ...errors, numberOfPassengers: '' })
                    }
                  }
                }}
                className={`text-center text-lg font-bold w-20 ${errors.numberOfPassengers ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (numberOfPassengers < 8) {
                    setNumberOfPassengers(numberOfPassengers + 1)
                    if (errors.numberOfPassengers) {
                      setErrors({ ...errors, numberOfPassengers: '' })
                    }
                  }
                }}
                disabled={numberOfPassengers >= 8}
                className="h-10 w-10 rounded-lg"
              >
                +
              </Button>
            </div>
            {errors.numberOfPassengers && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <X className="w-4 h-4" />
                {errors.numberOfPassengers}
              </p>
            )}
          </div>

          {/* Siège bébé */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              {locale === 'fr' ? 'Siège bébé requis ?' : locale === 'ar' ? 'مقعد الطفل مطلوب؟' : 'Baby seat required?'}
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setBabySeat(true)
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 min-h-[44px] touch-manipulation ${
                  babySeat
                    ? 'border-primary bg-primary/10 text-primary shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Check className={`w-5 h-5 ${babySeat ? 'opacity-100' : 'opacity-0'}`} />
                <span className="font-semibold">
                  {locale === 'fr' ? 'Oui' : locale === 'ar' ? 'نعم' : 'Yes'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBabySeat(false)
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 min-h-[44px] touch-manipulation ${
                  !babySeat
                    ? 'border-gray-400 bg-gray-100 text-gray-900 shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <X className={`w-5 h-5 ${!babySeat ? 'opacity-100' : 'opacity-0'}`} />
                <span className="font-semibold">
                  {locale === 'fr' ? 'Non' : locale === 'ar' ? 'لا' : 'No'}
                </span>
              </button>
            </div>
          </div>

          {/* Moyen de paiement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              {locale === 'fr' ? 'Moyen de paiement' : locale === 'ar' ? 'طريقة الدفع' : 'Payment method'} *
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash')
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 min-h-[44px] touch-manipulation ${
                  paymentMethod === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-500'}`} />
                <span className="font-semibold">
                  {locale === 'fr' ? 'Espèces' : locale === 'ar' ? 'نقداً' : 'Cash'}
                </span>
                {paymentMethod === 'cash' && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card')
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 min-h-[44px] touch-manipulation ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-semibold">
                  {locale === 'fr' ? 'Carte' : locale === 'ar' ? 'بطاقة' : 'Card'}
                </span>
                {paymentMethod === 'card' && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* Alert Box - Information sur l'acompte */}
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  {locale === 'fr' ? 'Sécurisation de votre trajet' : locale === 'ar' ? 'تأمين رحلتك' : 'Secure your trip'}
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {locale === 'fr'
                    ? 'Afin de garantir la disponibilité de votre chauffeur, un lien de paiement sécurisé (acompte ou totalité) vous sera envoyé par SMS/WhatsApp après validation de ce formulaire. La réservation ne sera définitive qu\'après ce règlement.'
                    : locale === 'ar'
                    ? 'لضمان توفر سائقك، سيتم إرسال رابط دفع آمن (عربون أو المبلغ الكامل) إليك عبر الرسائل القصيرة/واتساب بعد التحقق من هذا النموذج. لن يكون الحجز نهائياً إلا بعد هذا الدفع.'
                    : 'To guarantee your driver\'s availability, a secure payment link (deposit or full amount) will be sent to you by SMS/WhatsApp after validation of this form. The reservation will only be confirmed after this payment.'}
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 min-h-[44px]"
              >
                {locale === 'fr' ? 'Annuler' : locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 min-h-[44px]"
              >
                {locale === 'fr' ? 'Confirmer' : locale === 'ar' ? 'تأكيد' : 'Confirm'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

