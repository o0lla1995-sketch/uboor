export default function ConfidentialityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            العودة للرئيسية
          </a>
          <h1 className="text-3xl font-bold text-gray-900">سياسة السرية والأمان</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {[
          { title: '1. التزامنا بحماية بياناتك', text: 'نلتزم بحماية خصوصية المستخدمين وبياناتهم الشخصية بأعلى معايير الأمان. جميع البيانات المخزنة مشفرة بالكامل على خوادم آمنة.' },
          { title: '2. تشفير المستندات', text: 'جميع المستندات المرفوعة يتم تشفيرها تلقائياً باستخدام خوارزميات AES-256 قبل تخزينها.' },
          { title: '3. الوصول المحدود', text: 'يقتصر الوصول على منسقين لوجستيين موثوقين فقط. كل عملية وصول تُسجل في سجل تدقيق كامل.' },
          { title: '4. الحذف التلقائي', text: 'بعد إتمام إجراءات السفر، يتم حذف المستندات تلقائياً خلال 30 يوماً. يمكن طلب الحذف الفوري في أي وقت.' },
          { title: '5. عدم المشاركة', text: 'لا نشارك بياناتك مع أي جهة خارجية إلا بإذن كتابي صريح منك. لا نقوم ببيع أو تأجير البيانات.' },
        ].map(s => (
          <section key={s.title} className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{s.title}</h2>
            <p className="text-gray-700 leading-relaxed">{s.text}</p>
          </section>
        ))}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500"><p>منصة مساعدة السفر - غزة | سياسة السرية والأمان</p></div>
      </footer>
    </div>
  );
}
