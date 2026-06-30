'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { PassportOrder } from '@/types';
import { Shield, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react';

interface AdminOrder extends PassportOrder {
  user_profile?: { full_name: string; id_number: string };
}

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && !user.is_admin) {
      router.push('/dashboard');
      return;
    }
    if (user?.is_admin) fetchOrders();
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('passport_orders')
      .select('*, user_profile:users_profile(full_name, id_number)')
      .eq('payment_status', 'under_review')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const handleAction = async (orderId: string, action: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const updates: any = { 
        payment_status: action === 'approved' ? 'approved' : 'declined', 
        order_status: action === 'approved' ? 'processing' : 'rejected', 
        admin_notes: adminNotes || null 
      };
      if (action === 'approved') {
        const d = new Date(); d.setDate(d.getDate() + 21);
        updates.expected_delivery_date = d.toISOString().split('T')[0];
      }

      const { error } = await supabase.from('passport_orders').update(updates).eq('id', orderId);
      if (error) throw error;

      await fetch('/api/admin-webhook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_id: orderId, 
          action, 
          expected_delivery_date: updates.expected_delivery_date, 
          admin_notes: adminNotes 
        }),
      });

      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null); setAdminNotes('');
      alert(action === 'approved' ? 'تمت الموافقة' : 'تم الرفض');
    } catch (e: any) { alert('خطأ: ' + e.message); }
    finally { setProcessing(false); }
  };

  if (authLoading || !user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-400" />
            <div><h1 className="font-bold">بوابة الإدارة</h1><p className="text-xs text-gray-400">مراجعة المدفوعات</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-900 text-emerald-300 text-xs px-2 py-1 rounded-full">مسؤول</span>
            <button onClick={logout} className="text-gray-400 hover:text-white text-sm flex items-center gap-1"><LogOut className="w-4 h-4" /> خروج</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-gray-900">طلبات قيد المراجعة ({orders.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-12"><CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><p className="text-gray-500">لا يوجد طلبات قيد المراجعة</p></div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">طلب #{order.id.slice(0, 8)}</span>
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">قيد المراجعة</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div><p className="text-gray-500 text-xs">المستخدم</p><p className="font-medium text-gray-900">{order.user_profile?.full_name}</p></div>
                      <div><p className="text-gray-500 text-xs">رقم الهوية</p><p className="font-medium text-gray-900">{order.user_profile?.id_number}</p></div>
                      <div><p className="text-gray-500 text-xs">المبلغ</p><p className="font-medium text-gray-900">{order.amount} USDT</p></div>
                      <div><p className="text-gray-500 text-xs">التاريخ</p><p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString('ar-SA')}</p></div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3"><p className="text-xs text-gray-500 mb-1">TXID:</p><code className="text-sm text-gray-700 break-all font-mono">{order.usdt_txid}</code></div>
                  </div>
                </div>

                {selectedOrder === order.id ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات الإدارة</label>
                    <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="input-field mb-3" rows={3} placeholder="أضف ملاحظات (مطلوب للرفض)" />
                    <div className="flex gap-3">
                      <button onClick={() => handleAction(order.id, 'approved')} disabled={processing} className="btn-success flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {processing ? 'جاري...' : 'موافقة'}</button>
                      <button onClick={() => handleAction(order.id, 'rejected')} disabled={processing} className="btn-danger flex items-center gap-2"><XCircle className="w-4 h-4" /> {processing ? 'جاري...' : 'رفض'}</button>
                      <button onClick={() => { setSelectedOrder(null); setAdminNotes(''); }} className="btn-secondary">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => setSelectedOrder(order.id)} className="btn-primary text-sm">مراجعة الطلب</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
