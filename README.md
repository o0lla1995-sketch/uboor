# منصة مساعدة السفر - غزة v2.0

## التقنية
- **Frontend:** Next.js 14 + Tailwind CSS (Vercel)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Microservice:** Express + Telegraf (Render)

## التثبيت

### 1. Supabase
1. أنشئ مشروع جديد
2. شغّل `database/schema.sql` في SQL Editor
3. أنشئ Storage bucket اسمه `documents`
4. في Storage Policies أنشئ:
   - `INSERT`: `bucket_id = 'documents'`
   - `SELECT`: `bucket_id = 'documents'`
   - `DELETE`: `bucket_id = 'documents'`

### 2. Frontend (Vercel)
```bash
cd frontend
cp .env.local.example .env.local
# عدّل المتغيرات
npm install
npm run build
```

### 3. Backend (Render)
```bash
cd backend
cp .env.example .env
# عدّل المتغيرات
npm install
npm start
```

### 4. Telegram Bot
- @BotFather → أنشئ بوت → احفظ التوكن

### 5. تفعيل المسؤول
سجل أول حساب → في Supabase Table Editor → `users_profile` → `is_admin = true`

## المتغيرات

### Frontend `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
BACKEND_WEBHOOK_URL=
WEBHOOK_SECRET=
```

### Backend `.env`
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
WEBHOOK_SECRET=
FRONTEND_URL=
PORT=3001
```
