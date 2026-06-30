'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Globe, Lock, Clock, Users, ChevronDown, MessageCircle, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">مساعدة السفر</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('services')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">الخدمات</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">كيف يعمل</button>
              <button onClick={() => scrollToSection('security')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">الأمان</button>
              <a href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">من نحن</a>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors">
                تسجيل الدخول
              </button>
              <button onClick={() => router.push('/register')} className="btn-primary text-sm">
                إنشاء حساب
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-emerald-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              خدمات لوجستية موثوقة من مناطق النزاع
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              نُسهّل طريقك للسفر
              <span className="text-primary-600"> بأمان وسرية</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              منصة متخصصة في تسهيل إجراءات السفر والتنقل من قطاع غزة. 
              نقدم خدمات استخراج الجواز، التنسيق اللوجستي، والمتابعة الشفافة لكل خطوة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => router.push('/register')} className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
                ابدأ الآن مجاناً
                <ArrowLeft className="w-4 h-4 inline mr-2" />
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
                تعرّف على الخدمات
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'عائلة تمت خدمتها' },
              { value: '14-21', label: 'يوماً مدة التنفيذ' },
              { value: '100%', label: 'سرية البيانات' },
              { value: '24/7', label: 'دعم فني مستمر' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">خدماتنا</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">نقدم حلولاً متكاملة لتسهيل إجراءات السفر بأعلى معايير الأمان والسرعة</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'استخراج الجواز', desc: 'طلب استخراج أو تجديد جواز السفر خلال 14-21 يوماً مع متابعة لحظية لحالة الطلب.', color: 'bg-primary-50 text-primary-600' },
              { icon: Users, title: 'خدمات العائلة', desc: 'إضافة أفراد العائلة وطلب خدمات الجواز لهم بسهولة، مع إعفاء القصر من بعض المتطلبات.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Lock, title: 'حماية البيانات', desc: 'تشفير كامل للمستندات والبيانات الشخصية مع إمكانية الحذف التلقائي بعد إتمام السفر.', color: 'bg-amber-50 text-amber-600' },
            ].map((service) => (
              <div key={service.title} className="card hover:shadow-lg transition-shadow duration-300">
                <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">كيف يعمل؟</h2>
            <p className="text-gray-600">أربع خطوات بسيطة لطلب خدمتك</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'أنشئ حسابك', desc: 'سجل باستخدام رقم هويتك الفلسطينية وكلمة مرور آمنة' },
              { step: '02', title: 'أكمل ملفك', desc: 'أضف بياناتك الشخصية وأفراد عائلتك مع المستندات المطلوبة' },
              { step: '03', title: 'قدّم طلبك', desc: 'اختر الخدمة المطلوبة وادفع عبر USDT بشكل آمن' },
              { step: '04', title: 'تابع حالتك', desc: 'تلقّى تحديثات فورية عبر المنصة وتيليجرام حتى إتمام الطلب' },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-primary-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-primary-100 -z-10" style={{ transform: 'translateX(50%)' }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">أمانك هو أولويتنا</h2>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'تشفير AES-256', desc: 'جميع المستندات مشفرة قبل التخزين' },
                  { icon: Clock, title: 'حذف تلقائي', desc: 'المستندات تُحذف تلقائياً بعد 30 يوماً من إتمام السفر' },
                  { icon: Shield, title: 'وصول محدود', desc: 'فريق لوجستي موثوق فقط يمكنه الوصول للبيانات' },
                  { icon: CheckCircle, title: 'شفافية كاملة', desc: 'سجل تدقيق كامل لكل عملية وصول' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white">
              <Shield className="w-12 h-12 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">سياسة السرية والأمان</h3>
              <p className="text-primary-100 mb-6 leading-relaxed">
                نلتزم بحماية خصوصية مستخدمينا بأعلى معايير الأمان. لا نشارك بياناتك مع أي طرف ثالث، 
                ونعمل باستمرار على تحديث إجراءات الحماية لضمان أمان معلوماتك.
              </p>
              <a href="/confidentiality" className="inline-flex items-center gap-2 text-white font-medium hover:underline">
                اقرأ السياسة كاملة
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك الآن</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            انضم لمئات العائلات التي استفادت من خدماتنا. التسجيل مجاني والبيانات محمية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => router.push('/register')} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 w-full sm:w-auto">
              إنشاء حساب جديد
            </button>
            <button onClick={() => router.push('/login')} className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 w-full sm:w-auto">
              تسجيل الدخول
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">مساعدة السفر</span>
              </div>
              <p className="text-sm">منصة إنسانية ولوجستية لمساعدة السفر من مناطق النزاع.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <div className="space-y-2 text-sm">
                <a href="/login" className="block hover:text-white transition-colors">تسجيل الدخول</a>
                <a href="/register" className="block hover:text-white transition-colors">إنشاء حساب</a>
                <a href="/about" className="block hover:text-white transition-colors">من نحن</a>
                <a href="/confidentiality" className="block hover:text-white transition-colors">سياسة السرية</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الخدمات</h4>
              <div className="space-y-2 text-sm">
                <span className="block">استخراج الجواز</span>
                <span className="block">خدمات العائلة</span>
                <span className="block">المتابعة اللوجستية</span>
                <span className="block">الإشعارات الفورية</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>بوت تيليجرام</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>دعم فني 24/7</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>منصة مساعدة السفر - غزة | جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
