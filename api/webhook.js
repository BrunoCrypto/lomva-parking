export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') return res.status(200).end();

  const ACCESS_TOKEN = 'APP_USR-8651264368213008-080112-308567e9b581272e07ee4110393d1f9e-512818671';
  const SUPABASE_URL = 'https://zhmsfslyjuqqdpjqgjre.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobXNmc2x5anVxcWRwanFnanJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzczMDYsImV4cCI6MjEwMDQxMzMwNn0.cqJxQSvaBQ8bSPqNNeGZeGDkCVYIA_KHMe9lqOXHF-E';

  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data?.id;
      if (!paymentId) return res.status(200).end();

      // Obtener detalles del pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      });
      const payment = await paymentRes.json();

      if (payment.status === 'approved') {
        const reservaId = payment.external_reference;

        // Actualizar estado en Supabase
        await fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${reservaId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'pagado',
            mp_payment_id: String(paymentId),
            fecha_pago: new Date().toISOString()
          })
        });
      }
    }

    return res.status(200).end();
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).end();
  }
}
