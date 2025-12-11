'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Shield, Cookie } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export function LegalMentions() {
  const { locale } = useLocale()

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Titre principal */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {locale === 'fr' 
              ? 'Mentions Légales & Confidentialité'
              : locale === 'ar'
              ? 'الإشعارات القانونية والخصوصية'
              : 'Legal Notices & Privacy'}
          </h1>
          <p className="text-lg text-gray-600">
            {locale === 'fr'
              ? 'Informations légales et politique de protection des données'
              : locale === 'ar'
              ? 'المعلومات القانونية وسياسة حماية البيانات'
              : 'Legal information and data protection policy'}
          </p>
        </div>

        {/* Système d'onglets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 lg:p-12">
          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="legal" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {locale === 'fr' ? 'Mentions Légales' : locale === 'ar' ? 'الإشعارات القانونية' : 'Legal Notices'}
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {locale === 'fr' ? 'Confidentialité' : locale === 'ar' ? 'الخصوصية' : 'Privacy'}
              </TabsTrigger>
              <TabsTrigger value="cookies" className="flex items-center gap-2">
                <Cookie className="w-4 h-4" />
                {locale === 'fr' ? 'Cookies' : locale === 'ar' ? 'ملفات تعريف الارتباط' : 'Cookies'}
              </TabsTrigger>
            </TabsList>

            {/* Onglet Mentions Légales */}
            <TabsContent value="legal" className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-li:text-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {locale === 'fr' ? '1. Éditeur du Site' : locale === 'ar' ? '1. ناشر الموقع' : '1. Site Publisher'}
              </h2>
              <p className="mb-4">
                <strong>{locale === 'fr' ? 'Nom de la société :' : locale === 'ar' ? 'اسم الشركة:' : 'Company name:'}</strong> [VOTRE NOM DE SOCIÉTÉ]
              </p>
              <p className="mb-4">
                <strong>{locale === 'fr' ? 'Forme juridique :' : locale === 'ar' ? 'الشكل القانوني:' : 'Legal form:'}</strong> [SARL / SAS / EURL / etc.]
              </p>
              <p className="mb-4">
                <strong>{locale === 'fr' ? 'SIRET :' : locale === 'ar' ? 'رقم السجل التجاري:' : 'SIRET number:'}</strong> [VOTRE SIRET]
              </p>
              <p className="mb-4">
                <strong>{locale === 'fr' ? 'Siège social :' : locale === 'ar' ? 'المقر الرئيسي:' : 'Registered office:'}</strong> [VOTRE ADRESSE COMPLÈTE]
              </p>
              <p className="mb-4">
                <strong>{locale === 'fr' ? 'Directeur de publication :' : locale === 'ar' ? 'مدير النشر:' : 'Publication director:'}</strong> [NOM ET PRÉNOM]
              </p>
              <p className="mb-4">
                <strong>{locale === 'fr' ? 'Contact :' : locale === 'ar' ? 'جهة الاتصال:' : 'Contact:'}</strong> [VOTRE EMAIL]
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '2. Hébergeur' : locale === 'ar' ? '2. مزود الاستضافة' : '2. Hosting Provider'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.'
                  : locale === 'ar'
                  ? 'يتم استضافة هذا الموقع بواسطة Vercel Inc، 340 S Lemon Ave #4133، Walnut، CA 91789، الولايات المتحدة.'
                  : 'This site is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, United States.'}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '3. Propriété Intellectuelle' : locale === 'ar' ? '3. الملكية الفكرية' : '3. Intellectual Property'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'L\'ensemble du contenu de ce site (textes, images, vidéos, logos) est la propriété exclusive de [VOTRE NOM DE SOCIÉTÉ] et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.'
                  : locale === 'ar'
                  ? 'جميع محتويات هذا الموقع (نصوص، صور، فيديوهات، شعارات) هي ملكية حصرية لـ [VOTRE NOM DE SOCIÉTÉ] ومحمية بموجب القوانين الفرنسية والدولية المتعلقة بالملكية الفكرية.'
                  : 'All content on this site (texts, images, videos, logos) is the exclusive property of [YOUR COMPANY NAME] and is protected by French and international intellectual property laws.'}
              </p>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Toute reproduction, même partielle, est strictement interdite sans autorisation préalable écrite.'
                  : locale === 'ar'
                  ? 'يُحظر تماماً أي نسخ، حتى جزئي، دون إذن مسبق كتابي.'
                  : 'Any reproduction, even partial, is strictly prohibited without prior written authorization.'}
              </p>
            </TabsContent>

            {/* Onglet Confidentialité */}
            <TabsContent value="privacy" className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-li:text-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {locale === 'fr' ? '1. Données Collectées' : locale === 'ar' ? '1. البيانات المجمعة' : '1. Data Collected'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Dans le cadre de notre service VTC, nous collectons les données suivantes :'
                  : locale === 'ar'
                  ? 'في إطار خدمة VTC الخاصة بنا، نجمع البيانات التالية:'
                  : 'As part of our VTC service, we collect the following data:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>{locale === 'fr' ? 'Données de géolocalisation :' : locale === 'ar' ? 'بيانات الموقع الجغرافي:' : 'Geolocation data:'}</strong>{' '}
                  {locale === 'fr'
                    ? 'Uniquement lorsque vous utilisez la fonction "Ma position" pour calculer le tarif de votre trajet. Ces données sont utilisées uniquement pour la prestation de service et ne sont pas stockées après utilisation.'
                    : locale === 'ar'
                    ? 'فقط عند استخدام وظيفة "موقعي" لحساب تعريفة رحلتك. تُستخدم هذه البيانات فقط لتقديم الخدمة ولا يتم تخزينها بعد الاستخدام.'
                    : 'Only when you use the "My location" feature to calculate your trip fare. This data is used solely for service delivery and is not stored after use.'}
                </li>
                <li>
                  <strong>{locale === 'fr' ? 'Informations de réservation :' : locale === 'ar' ? 'معلومات الحجز:' : 'Booking information:'}</strong>{' '}
                  {locale === 'fr'
                    ? 'Nom, prénom, nombre de passagers, moyen de paiement préféré. Ces données sont nécessaires pour traiter votre demande de réservation.'
                    : locale === 'ar'
                    ? 'الاسم، الاسم الأول، عدد الركاب، طريقة الدفع المفضلة. هذه البيانات ضرورية لمعالجة طلب الحجز الخاص بك.'
                    : 'Name, first name, number of passengers, preferred payment method. This data is necessary to process your booking request.'}
                </li>
                <li>
                  <strong>{locale === 'fr' ? 'Adresses saisies :' : locale === 'ar' ? 'العناوين المدخلة:' : 'Entered addresses:'}</strong>{' '}
                  {locale === 'fr'
                    ? 'Les adresses de départ et d\'arrivée que vous saisissez pour le calcul du trajet.'
                    : locale === 'ar'
                    ? 'عناوين المغادرة والوصول التي تدخلها لحساب الرحلة.'
                    : 'Departure and arrival addresses you enter for trip calculation.'}
                </li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '2. Utilisation des Données' : locale === 'ar' ? '2. استخدام البيانات' : '2. Data Usage'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Vos données personnelles sont utilisées exclusivement pour :'
                  : locale === 'ar'
                  ? 'تُستخدم بياناتك الشخصية حصرياً من أجل:'
                  : 'Your personal data is used exclusively for:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  {locale === 'fr'
                    ? 'Le calcul et l\'estimation du prix de votre trajet'
                    : locale === 'ar'
                    ? 'حساب وتقدير سعر رحلتك'
                    : 'Calculating and estimating the price of your trip'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Le traitement de votre demande de réservation via WhatsApp'
                    : locale === 'ar'
                    ? 'معالجة طلب الحجز الخاص بك عبر واتساب'
                    : 'Processing your booking request via WhatsApp'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'L\'amélioration de nos services de transport'
                    : locale === 'ar'
                    ? 'تحسين خدمات النقل لدينا'
                    : 'Improving our transportation services'}
                </li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '3. Stockage et Sécurité' : locale === 'ar' ? '3. التخزين والأمان' : '3. Storage and Security'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Vos données sont stockées de manière sécurisée sur Supabase, une plateforme cloud conforme au RGPD (Règlement Général sur la Protection des Données).'
                  : locale === 'ar'
                  ? 'يتم تخزين بياناتك بشكل آمن على Supabase، وهي منصة سحابية متوافقة مع GDPR (اللائحة العامة لحماية البيانات).'
                  : 'Your data is stored securely on Supabase, a GDPR-compliant cloud platform.'}
              </p>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Nous mettons en œuvre toutes les mesures techniques et organisationnelles nécessaires pour protéger vos données contre tout accès non autorisé, perte ou altération.'
                  : locale === 'ar'
                  ? 'نطبق جميع التدابير التقنية والتنظيمية اللازمة لحماية بياناتك من أي وصول غير مصرح به أو فقدان أو تغيير.'
                  : 'We implement all necessary technical and organizational measures to protect your data against unauthorized access, loss or alteration.'}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '4. Vos Droits' : locale === 'ar' ? '4. حقوقك' : '4. Your Rights'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :'
                  : locale === 'ar'
                  ? 'وفقاً لـ GDPR، لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:'
                  : 'In accordance with GDPR, you have the following rights regarding your personal data:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>{locale === 'fr' ? 'Droit d\'accès à vos données' : locale === 'ar' ? 'حق الوصول إلى بياناتك' : 'Right of access to your data'}</li>
                <li>{locale === 'fr' ? 'Droit de rectification' : locale === 'ar' ? 'حق التصحيح' : 'Right to rectification'}</li>
                <li>{locale === 'fr' ? 'Droit à l\'effacement' : locale === 'ar' ? 'حق الحذف' : 'Right to erasure'}</li>
                <li>{locale === 'fr' ? 'Droit à la portabilité' : locale === 'ar' ? 'حق قابلية النقل' : 'Right to portability'}</li>
                <li>{locale === 'fr' ? 'Droit d\'opposition' : locale === 'ar' ? 'حق المعارضة' : 'Right to object'}</li>
              </ul>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Pour exercer ces droits, contactez-nous à l\'adresse : [VOTRE EMAIL]'
                  : locale === 'ar'
                  ? 'لممارسة هذه الحقوق، اتصل بنا على العنوان: [VOTRE EMAIL]'
                  : 'To exercise these rights, contact us at: [YOUR EMAIL]'}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '5. Utilisation de Google Maps API' : locale === 'ar' ? '5. استخدام Google Maps API' : '5. Use of Google Maps API'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Notre site utilise Google Maps API pour vous fournir :'
                  : locale === 'ar'
                  ? 'يستخدم موقعنا Google Maps API لتزويدك بـ:'
                  : 'Our site uses Google Maps API to provide you with:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  {locale === 'fr'
                    ? 'L\'autocomplétion des adresses de départ et d\'arrivée'
                    : locale === 'ar'
                    ? 'الإكمال التلقائي لعناوين المغادرة والوصول'
                    : 'Autocomplete for departure and arrival addresses'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Le calcul de la distance et du temps de trajet'
                    : locale === 'ar'
                    ? 'حساب المسافة ووقت الرحلة'
                    : 'Calculation of distance and travel time'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'L\'affichage de cartes interactives'
                    : locale === 'ar'
                    ? 'عرض الخرائط التفاعلية'
                    : 'Display of interactive maps'}
                </li>
              </ul>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'L\'utilisation de Google Maps est soumise à la politique de confidentialité de Google. Pour plus d\'informations, consultez : https://policies.google.com/privacy'
                  : locale === 'ar'
                  ? 'يخضع استخدام Google Maps لسياسة خصوصية Google. لمزيد من المعلومات، راجع: https://policies.google.com/privacy'
                  : 'The use of Google Maps is subject to Google\'s privacy policy. For more information, visit: https://policies.google.com/privacy'}
              </p>
            </TabsContent>

            {/* Onglet Cookies */}
            <TabsContent value="cookies" className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-li:text-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {locale === 'fr' ? '1. Qu\'est-ce qu\'un Cookie ?' : locale === 'ar' ? '1. ما هو ملف تعريف الارتباط؟' : '1. What is a Cookie?'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur notre site. Il permet de reconnaître votre navigateur et d\'améliorer votre expérience de navigation.'
                  : locale === 'ar'
                  ? 'ملف تعريف الارتباط هو ملف نصي صغير يتم وضعه على جهازك أثناء زيارتك لموقعنا. يسمح بالتعرف على متصفحك وتحسين تجربة التصفح لديك.'
                  : 'A cookie is a small text file placed on your device when you visit our site. It allows us to recognize your browser and improve your browsing experience.'}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '2. Cookies Utilisés sur ce Site' : locale === 'ar' ? '2. ملفات تعريف الارتباط المستخدمة على هذا الموقع' : '2. Cookies Used on This Site'}
              </h2>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 mt-6">
                {locale === 'fr' ? 'Cookies Strictement Nécessaires' : locale === 'ar' ? 'ملفات تعريف الارتباط الضرورية بشكل صارم' : 'Strictly Necessary Cookies'}
              </h3>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés :'
                  : locale === 'ar'
                  ? 'هذه الملفات ضرورية لعمل الموقع ولا يمكن تعطيلها:'
                  : 'These cookies are essential for the site to function and cannot be disabled:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>{locale === 'fr' ? 'Cookies de session :' : locale === 'ar' ? 'ملفات تعريف الارتباط للجلسة:' : 'Session cookies:'}</strong>{' '}
                  {locale === 'fr'
                    ? 'Pour maintenir votre session active et mémoriser vos préférences de langue'
                    : locale === 'ar'
                    ? 'للحفاظ على جلستك نشطة وتذكر تفضيلات اللغة الخاصة بك'
                    : 'To keep your session active and remember your language preferences'}
                </li>
                <li>
                  <strong>{locale === 'fr' ? 'Cookies de sécurité :' : locale === 'ar' ? 'ملفات تعريف الارتباط للأمان:' : 'Security cookies:'}</strong>{' '}
                  {locale === 'fr'
                    ? 'Pour protéger le site contre les attaques et garantir votre sécurité'
                    : locale === 'ar'
                    ? 'لحماية الموقع من الهجمات وضمان أمانك'
                    : 'To protect the site against attacks and ensure your security'}
                </li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 mt-6">
                {locale === 'fr' ? 'Cookies Google Maps' : locale === 'ar' ? 'ملفات تعريف الارتباط لـ Google Maps' : 'Google Maps Cookies'}
              </h3>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Notre site utilise Google Maps API qui peut déposer des cookies pour :'
                  : locale === 'ar'
                  ? 'يستخدم موقعنا Google Maps API الذي قد يضع ملفات تعريف الارتباط من أجل:'
                  : 'Our site uses Google Maps API which may place cookies for:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  {locale === 'fr'
                    ? 'Charger les cartes et l\'autocomplétion des adresses'
                    : locale === 'ar'
                    ? 'تحميل الخرائط والإكمال التلقائي للعناوين'
                    : 'Loading maps and address autocomplete'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Mémoriser vos préférences de carte'
                    : locale === 'ar'
                    ? 'تذكر تفضيلات الخريطة الخاصة بك'
                    : 'Remembering your map preferences'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Améliorer les performances de chargement'
                    : locale === 'ar'
                    ? 'تحسين أداء التحميل'
                    : 'Improving loading performance'}
                </li>
              </ul>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Ces cookies sont gérés par Google. Pour plus d\'informations, consultez la politique de cookies de Google : https://policies.google.com/technologies/cookies'
                  : locale === 'ar'
                  ? 'تُدار هذه الملفات بواسطة Google. لمزيد من المعلومات، راجع سياسة ملفات تعريف الارتباط الخاصة بـ Google: https://policies.google.com/technologies/cookies'
                  : 'These cookies are managed by Google. For more information, see Google\'s cookie policy: https://policies.google.com/technologies/cookies'}
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 mt-6">
                {locale === 'fr' ? 'Cookies Analytics (Optionnels)' : locale === 'ar' ? 'ملفات تعريف الارتباط للتحليلات (اختياري)' : 'Analytics Cookies (Optional)'}
              </h3>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Si vous acceptez les cookies analytiques, nous pouvons utiliser des outils d\'analyse pour comprendre comment les visiteurs utilisent notre site et améliorer notre service. Ces cookies sont optionnels et peuvent être désactivés à tout moment.'
                  : locale === 'ar'
                  ? 'إذا قبلت ملفات تعريف الارتباط التحليلية، يمكننا استخدام أدوات التحليل لفهم كيفية استخدام الزوار لموقعنا وتحسين خدمتنا. هذه الملفات اختيارية ويمكن تعطيلها في أي وقت.'
                  : 'If you accept analytics cookies, we may use analytics tools to understand how visitors use our site and improve our service. These cookies are optional and can be disabled at any time.'}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8">
                {locale === 'fr' ? '3. Gestion de Vos Cookies' : locale === 'ar' ? '3. إدارة ملفات تعريف الارتباط الخاصة بك' : '3. Managing Your Cookies'}
              </h2>
              <p className="mb-4">
                {locale === 'fr'
                  ? 'Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur :'
                  : locale === 'ar'
                  ? 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط الخاصة بك عبر إعدادات المتصفح:'
                  : 'You can manage your cookie preferences via your browser settings:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  {locale === 'fr'
                    ? 'Chrome : Paramètres → Confidentialité et sécurité → Cookies'
                    : locale === 'ar'
                    ? 'Chrome: الإعدادات → الخصوصية والأمان → ملفات تعريف الارتباط'
                    : 'Chrome: Settings → Privacy and security → Cookies'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Firefox : Options → Vie privée et sécurité → Cookies'
                    : locale === 'ar'
                    ? 'Firefox: الخيارات → الخصوصية والأمان → ملفات تعريف الارتباط'
                    : 'Firefox: Options → Privacy & Security → Cookies'}
                </li>
                <li>
                  {locale === 'fr'
                    ? 'Safari : Préférences → Confidentialité → Cookies'
                    : locale === 'ar'
                    ? 'Safari: التفضيلات → الخصوصية → ملفات تعريف الارتباط'
                    : 'Safari: Preferences → Privacy → Cookies'}
                </li>
              </ul>
              <p className="mb-4 text-sm text-gray-500 italic">
                {locale === 'fr'
                  ? 'Note : La désactivation de certains cookies peut affecter le fonctionnement du site.'
                  : locale === 'ar'
                  ? 'ملاحظة: قد يؤثر تعطيل بعض ملفات تعريف الارتباط على عمل الموقع.'
                  : 'Note: Disabling some cookies may affect site functionality.'}
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Date de mise à jour */}
        <div className="text-center mt-8 text-sm text-gray-500">
          {locale === 'fr'
            ? `Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`
            : locale === 'ar'
            ? `آخر تحديث: ${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}`
            : `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
        </div>
      </div>
    </div>
  )
}

