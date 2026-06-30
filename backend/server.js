require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

app.use(cors());
app.use(express.json());

// Telegram Deep Linking
bot.start(async (ctx) => {
  const payload = ctx.message.text.split(' ')[1];
  if (!payload) {
    return ctx.reply('مرحباً بك في بوت مساعدة السفر - غزة 🛡️\n\nاضغط "ربط تيليجرام" من الموقع.', {
      reply_markup: { inline_keyboard: [[{ text: 'فتح الموقع', url: process.env.FRONTEND_URL }]] }
    });
  }

  const userId = payload;
  const chatId = ctx.chat.id.toString();

  try {
    const { data: profile } = await supabaseAdmin.from('users_profile').select('full_name').eq('id', userId).single();
    if (!profile) return ctx.reply('❌ لم يتم العثور على حسابك. سجل في الموقع أولاً.');

    await supabaseAdmin.from('users_profile').update({ telegram_chat_id: chatId }).eq('id', userId);
    await ctx.reply(`✅ تم الربط بنجاح ${profile.full_name}!\n\n/stats - حالة الطلب`);
  } catch (e) {
    ctx.reply('❌ خطأ في الربط. حاول لاحقاً.');
  }
});

bot.command('status', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  try {
    const { data: profile } = await supabaseAdmin.from('users_profile').select('id, full_name').eq('telegram_chat_id', chatId).single();
    if (!profile) return ctx.reply('❌ لم يتم الربط. اضغط "ربط تيليجرام" من الموقع.');

    const { data: orders } = await supabaseAdmin.from('passport_orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(1);
    if (!orders?.length) return ctx.reply(`مرحباً ${profile.full_name}!\nلا يوجد طلبات حالياً.`);

    const o = orders[0];
    const s = { pending: '⏳ معلق', processing: '🔄 قيد المعالجة', completed: '✅ مكتمل', rejected: '❌ مرفوض' };
    const p = { under_review: 'قيد المراجعة', approved: 'تمت الموافقة', declined: 'تم الرفض' };
    let msg = `📋 حالة طلبك\n*رقم الطلب:* #${o.id.slice(0, 8)}\n*حالة الطلب:* ${s[o.order_status] || o.order_status}\n*حالة الدفع:* ${p[o.payment_status]}\n*المبلغ:* ${o.amount} USDT`;
    if (o.expected_delivery_date) msg += `\n*التسليم المتوقع:* ${o.expected_delivery_date}`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (e) { ctx.reply('❌ خطأ.'); }
});

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  const chatId = ctx.chat.id.toString();
  const { data: profile } = await supabaseAdmin.from('users_profile').select('full_name').eq('telegram_chat_id', chatId).single();
  if (!profile) return ctx.reply('👋 مرحباً! سجل في الموقع واربط تيليجرام.\n/status - حالة الطلب');
  await ctx.reply(`مرحباً ${profile.full_name}! 👋\n/status - لمعرفة حالة طلبك`);
});

// Webhook endpoint
app.post('/api/supabase-webhook', async (req, res) => {
  try {
    const { type, order_id, action, expected_delivery_date, admin_notes } = req.body;
    if (req.headers['x-webhook-secret'] !== process.env.WEBHOOK_SECRET) return res.status(401).json({ error: 'Unauthorized' });

    if (type === 'admin_action') {
      const { data: order } = await supabaseAdmin.from('passport_orders').select('*, user_profile:users_profile(telegram_chat_id, full_name)').eq('id', order_id).single();
      if (!order?.user_profile?.telegram_chat_id) return res.json({ ok: true });

      const chatId = order.user_profile.telegram_chat_id;
      if (action === 'approved') {
        await bot.telegram.sendMessage(chatId,
          `✅ *تم تأكيد الدفع!*\n\nمرحباً ${order.user_profile.full_name}،\nتمت الموافقة على ${order.amount} USDT.\n📅 التسليم المتوقع: ${expected_delivery_date || '14-21 يوماً'}`,
          { parse_mode: 'Markdown' }
        );
      } else if (action === 'rejected') {
        await bot.telegram.sendMessage(chatId,
          `❌ *تم رفض الدفع*\n\nالسبب: ${admin_notes || 'تواصل مع الدعم'}`,
          { parse_mode: 'Markdown' }
        );
      }
    }

    if (type === 'order_status_change') {
      const { user_id, order_status } = req.body;
      const { data: profile } = await supabaseAdmin.from('users_profile').select('telegram_chat_id, full_name').eq('id', user_id).single();
      if (!profile?.telegram_chat_id) return res.json({ ok: true });

      let msg = '';
      if (order_status === 'completed') msg = `🎉 *تهانينا ${profile.full_name}!*\nتم إنجاز طلب جواز السفر.`;
      else if (order_status === 'rejected') msg = `❌ *تم رفض الطلب*\nتواصل مع الدعم.`;
      if (msg) await bot.telegram.sendMessage(profile.telegram_chat_id, msg, { parse_mode: 'Markdown' });
    }

    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.json({ status: 'ok', service: 'Gaza Travel Backend', endpoints: ['/health', '/api/supabase-webhook'] }));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
bot.launch().then(() => console.log('🤖 Bot started')).catch(e => console.error(e));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
