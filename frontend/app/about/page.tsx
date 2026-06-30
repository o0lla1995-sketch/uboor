export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            العودة للرئيسية
          </a>
          <h1 className="text-3xl font-bold text-gray-900">من نحن</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">رسالتنا</h2>
          <p className="text-gray-700 leading-relaxed mb-4">نحن منصة إنسانية ولوجستية متخصصة في تسهيل حركة السفر والتنقل للأفراد والعائلات في مناطق النزاع، وعلى وجه التحديد قطاع غزة. نسعى لتوفير قناة آمنة وشفافة تربط بين الأفراد والجهات اللوجستية الموثوقة.</p>
          <p className="text-gray-700 leading-relaxed">في ظل الظروف الاستثنائية التي يعيشها أهلنا في غزة، نؤمن بأن الوصول إلى خدمات السفر الآمن ليس رفاهية بل حق إنساني أساسي.</p>
        </section>
        <section className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">قيمنا</h2>
          <ul className="space-y-3 text-gray-700">
            {['الأمان: حماية بيانات المستخدمين ومستنداتهم بأعلى معايير الأمان والتشفير.', 'الشفافية: إطلاع المستخدم على كل خطوة في رحلته اللوجستية.', 'السرعة: تقليل الوقت المستغرق في الإجراءات اللوجستية.', 'الدعم: توفير قنوات تواصل فعالة للإجابة على الاستفسارات.'].map((v, i) => (
              <li key={i} className="flex items-start gap-3"><span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span><span>{v}</span></li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500"><p>منصة مساعدة السفر - غزة | جميع الحقوق محفوظة</p></div>
      </footer>
    </div>
  );
}
