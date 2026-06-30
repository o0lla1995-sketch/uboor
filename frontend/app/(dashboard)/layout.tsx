'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, LogOut, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const connectTelegram = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'YourBotUsername';
    window.open(`https://t.me/${botUsername}?start=${user.id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">{user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!user.telegram_chat_id && (
              <button onClick={connectTelegram} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> ربط تيليجرام
              </button>
            )}
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">الرئيسية</Link>
            <button onClick={logout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 px-3 py-1.5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> خروج
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
