'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, isUnderage } from '@/lib/utils';
import type { FamilyMember, PassportOrder } from '@/types';
import {
  User, Users, CreditCard, Upload, AlertTriangle, CheckCircle,
  Clock, Copy, Plus, Trash2, FileImage, Wallet, ChevronRight
} from 'lucide-react';

const PLATFORM_WALLET = 'TRC20_WALLET_ADDRESS_HERE';
const PASSPORT_AMOUNT = 150;

export default function DashboardPage() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [orders, setOrders] = useState<PassportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'passport'>('profile');
  const [uploading, setUploading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    passport_status: user?.passport_status || 'none' as 'valid' | 'expired' | 'none',
  });

  const [familyForm, setFamilyForm] = useState({
    full_name: '', id_number: '', birth_date: '', passport_status: 'none' as 'valid' | 'expired' | 'none',
  });
  const [showFamilyForm, setShowFamilyForm] = useState(false);

  const [orderForm, setOrderForm] = useState({
    target_type: 'main_user' as 'main_user' | 'family_member',
    target_id: '', usdt_txid: '', amount: PASSPORT_AMOUNT,
  });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [{ data: familyData }, { data: ordersData }] = await Promise.all([
        supabase.from('family_members').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('passport_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setFamilyMembers(familyData || []);
      setOrders(ordersData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchData();
    if (user) setProfileForm({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      passport_status: user.passport_status || 'none',
    });
  }, [user, fetchData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('users_profile').update({
      full_name: profileForm.full_name,
      phone_number: profileForm.phone_number,
      passport_status: profileForm.passport_status,
      has_passport: profileForm.passport_status === 'valid',
    }).eq('id', user.id);
    if (error) alert('خطأ: ' + error.message);
    else alert('تم التحديث بنجاح');
  };

  const handleFileUpload = async (file: File, type: 'identity' | 'passport') => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileName = `${user.id}_${type}_${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('documents').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
      const field = type === 'identity' ? 'identity_card_image_url' : 'passport_image_url';
      await supabase.from('users_profile').update({ [field]: publicUrl }).eq('id', user.id);
      alert('تم الرفع بنجاح');
    } catch (e: any) { alert('خطأ: ' + e.message); }
    finally { setUploading(false); }
  };

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const underage = isUnderage(familyForm.birth_date);
    if (!underage && !/^\d{9}$/.test(familyForm.id_number)) {
      alert('رقم الهوية يجب أن يكون 9 أرقام'); return;
    }
    const { error } = await supabase.from('family_members').insert({
      user_id: user.id, full_name: familyForm.full_name,
      id_number: underage ? null : familyForm.id_number,
      birth_date: familyForm.birth_date,
      passport_status: familyForm.passport_status,
      has_passport: familyForm.passport_status === 'valid',
    });
    if (error) alert('خطأ: ' + error.message);
    else {
      setFamilyForm({ full_name: '', id_number: '', birth_date: '', passport_status: 'none' });
      setShowFamilyForm(false); fetchData();
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    await supabase.from('family_members').delete().eq('id', id);
    fetchData();
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!orderForm.usdt_txid.trim()) { alert('TXID مطلوب'); return; }
    const targetId = orderForm.target_type === 'main_user' ? user.id : orderForm.target_id;
    const { error } = await supabase.from('passport_orders').insert({
      user_id: user.id, target_type: orderForm.target_type, target_id: targetId,
      usdt_txid: orderForm.usdt_txid.trim(), amount: orderForm.amount,
    });
    if (error) alert('خطأ: ' + error.message);
    else { setShowOrderForm(false); setOrderForm({ target_type: 'main_user', target_id: '', usdt_txid: '', amount: PASSPORT_AMOUNT }); fetchData(); }
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(PLATFORM_WALLET);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const getBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700', processing: 'bg-primary-100 text-primary-700',
      completed: 'bg-emerald-100 text-emerald-700', rejected: 'bg-rose-100 text-rose-700',
      under_review: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700',
      declined: 'bg-rose-100 text-rose-700',
    };
    const labels: Record<string, string> = {
      pending: 'معلق', processing: 'قيد المعالجة', completed: 'مكتمل', rejected: 'مرفوض',
      under_review: 'قيد المراجعة', approved: 'تمت الموافقة', declined: 'تم الرفض',
    };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || map.pending}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-6">
        {[
          { id: 'profile', label: 'الملف الشخصي', icon: User },
          { id: 'family', label: 'أفراد العائلة', icon: Users },
          { id: 'passport', label: 'خدمة الجواز', icon: CreditCard },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Passport Alert */}
      {user && (user.passport_status === 'expired' || user.passport_status === 'none') && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">تنبيه هام</p>
            <p className="text-sm mt-1">جواز السفر غير فعال أو غير موجود. يمكنك طلب استخراج جواز جديد خلال 14-21 يوماً عبر الدفع بـ USDT.</p>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary-600" /> المعلومات الشخصية</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label><input value={user?.id_number || ''} disabled className="input-field bg-gray-100 text-gray-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label><input value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label><input value={profileForm.phone_number} onChange={e => setProfileForm(p => ({ ...p, phone_number: e.target.value }))} className="input-field text-left" dir="ltr" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">حالة الجواز</label>
                  <select value={profileForm.passport_status} onChange={e => { const s = e.target.value as any; setProfileForm(p => ({ ...p, passport_status: s, has_passport: s === 'valid' })); }} className="input-field">
                    <option value="none">لا يوجد</option><option value="valid">ساري المفعول</option><option value="expired">منتهي الصلاحية</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary">حفظ التغييرات</button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FileImage className="w-5 h-5 text-primary-600" /> المستندات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ type: 'identity' as const, label: 'بطاقة الهوية' }, { type: 'passport' as const, label: 'صورة الجواز' }].map(doc => (
                <div key={doc.type} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">{doc.label}</p>
                  <p className="text-xs text-gray-500 mb-3">JPEG, PNG</p>
                  <label className="btn-primary text-sm cursor-pointer inline-block">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], doc.type)} disabled={uploading} />
                    {uploading ? 'جاري...' : 'اختر ملف'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Family Tab */}
      {activeTab === 'family' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-primary-600" /> أفراد العائلة</h2>
            <button onClick={() => setShowFamilyForm(!showFamilyForm)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> {showFamilyForm ? 'إلغاء' : 'إضافة'}</button>
          </div>

          {showFamilyForm && (
            <form onSubmit={handleAddFamily} className="bg-gray-50 p-4 rounded-xl mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label><input value={familyForm.full_name} onChange={e => setFamilyForm(p => ({ ...p, full_name: e.target.value }))} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label><input type="date" value={familyForm.birth_date} onChange={e => setFamilyForm(p => ({ ...p, birth_date: e.target.value }))} className="input-field text-left" dir="ltr" required /></div>
                {familyForm.birth_date && !isUnderage(familyForm.birth_date) && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية *</label><input value={familyForm.id_number} onChange={e => setFamilyForm(p => ({ ...p, id_number: e.target.value }))} className="input-field text-left" dir="ltr" maxLength={9} placeholder="9 أرقام" required /></div>
                )}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">حالة الجواز</label>
                  <select value={familyForm.passport_status} onChange={e => { const s = e.target.value as any; setFamilyForm(p => ({ ...p, passport_status: s, has_passport: s === 'valid' })); }} className="input-field">
                    <option value="none">لا يوجد</option><option value="valid">ساري</option><option value="expired">منتهي</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary text-sm">حفظ</button>
            </form>
          )}

          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>لا يوجد أفراد مسجلين</p></div>
          ) : (
            <div className="space-y-3">
              {familyMembers.map(m => (
                <div key={m.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{m.full_name}</h3>
                      {m.is_underage && <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">قاصر</span>}
                    </div>
                    <div className="text-sm text-gray-500">{m.id_number && <p>رقم الهوية: {m.id_number}</p>}<p>تاريخ الميلاد: {formatDate(m.birth_date)}</p><div className="flex items-center gap-2 mt-1"><span>حالة الجواز:</span>{getBadge(m.passport_status)}</div></div>
                  </div>
                  <button onClick={() => handleDeleteFamily(m.id)} className="text-gray-400 hover:text-rose-600 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Passport Tab */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-primary-600" /> خدمة استخراج الجواز</h2>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-primary-800 mb-1"><strong>تكلفة الخدمة:</strong> {PASSPORT_AMOUNT} USDT</p>
              <p className="text-sm text-primary-700">مدة التنفيذ: 14-21 يوماً</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">عنوان المحفظة (TRC-20)</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-emerald-400 text-sm font-mono break-all">{PLATFORM_WALLET}</code>
                <button onClick={copyWallet} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700">
                  {copiedWallet ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copiedWallet ? 'تم' : 'نسخ'}
                </button>
              </div>
            </div>
            <button onClick={() => setShowOrderForm(!showOrderForm)} className="btn-primary w-full flex items-center justify-center gap-2"><CreditCard className="w-4 h-4" /> {showOrderForm ? 'إلغاء' : 'طلب جديد'}</button>

            {showOrderForm && (
              <form onSubmit={handleSubmitOrder} className="mt-6 bg-gray-50 p-4 rounded-xl space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">الفرد المستفيد</label>
                  <select value={orderForm.target_type} onChange={e => setOrderForm(p => ({ ...p, target_type: e.target.value as any, target_id: '' }))} className="input-field">
                    <option value="main_user">أنا</option><option value="family_member">فرد من العائلة</option>
                  </select>
                </div>
                {orderForm.target_type === 'family_member' && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">اختر فرد العائلة</label>
                    <select value={orderForm.target_id} onChange={e => setOrderForm(p => ({ ...p, target_id: e.target.value }))} className="input-field" required>
                      <option value="">-- اختر --</option>
                      {familyMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                  </div>
                )}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">معرف المعاملة (TXID)</label><input value={orderForm.usdt_txid} onChange={e => setOrderForm(p => ({ ...p, usdt_txid: e.target.value }))} className="input-field text-left" dir="ltr" placeholder="TXID" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (USDT)</label><input type="number" value={orderForm.amount} onChange={e => setOrderForm(p => ({ ...p, amount: parseFloat(e.target.value) }))} className="input-field text-left" dir="ltr" min={1} step={0.01} required /></div>
                <button type="submit" className="btn-primary w-full">إرسال الطلب</button>
              </form>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-primary-600" /> سجل الطلبات</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500"><Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>لا يوجد طلبات</p></div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div><p className="text-sm font-medium text-gray-900">طلب #{o.id.slice(0, 8)}</p><p className="text-xs text-gray-500">{formatDate(o.created_at)}</p></div>
                      <div className="flex flex-col items-end gap-1">{getBadge(o.order_status)}{getBadge(o.payment_status)}</div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>المبلغ: {o.amount} USDT</p><p className="text-xs text-gray-400 break-all">TXID: {o.usdt_txid}</p>
                      {o.expected_delivery_date && <p className="text-emerald-600">التسليم المتوقع: {formatDate(o.expected_delivery_date)}</p>}
                      {o.admin_notes && <p className="text-gray-500 text-xs mt-2 bg-gray-50 p-2 rounded">ملاحظات: {o.admin_notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
