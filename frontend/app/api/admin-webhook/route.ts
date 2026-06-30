import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, action, expected_delivery_date, admin_notes } = body;

    const backendUrl = process.env.BACKEND_WEBHOOK_URL || 'http://localhost:3001/api/supabase-webhook';

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || '',
      },
      body: JSON.stringify({
        type: 'admin_action',
        order_id,
        action,
        expected_delivery_date,
        admin_notes,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Backend webhook failed');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
