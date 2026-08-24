export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ACCESS_TOKEN = 'APP_USR-8651264368213008-080112-308567e9b581272e07ee4110393d1f9e-512818671';

  try {
    const { titulo, precio, reserva_id, nombre, email, celular } = req.body;

    const preference = {
      items: [
        {
          title: titulo || 'Lomva Parking',
          quantity: 1,
          unit_price: parseFloat(precio),
          currency_id: 'ARS',
        }
      ],
      payer: {
        name: nombre || '',
        email: email || 'blombardi@lomva.com.ar',
        phone: {}
      },
      back_urls: {
        success: `https://lomva-parking.vercel.app?pago=exitoso&reserva_id=${reserva_id}`,
        failure: `https://lomva-parking.vercel.app?pago=fallido&reserva_id=${reserva_id}`,
        pending: `https://lomva-parking.vercel.app?pago=pendiente&reserva_id=${reserva_id}`,
      },
      auto_return: 'approved',
      external_reference: reserva_id,
      statement_descriptor: 'LOMVA PARKING',
      expires: false,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': reserva_id,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (data.init_point) {
      return res.status(200).json({
        init_point: data.init_point,
        preference_id: data.id
      });
    } else {
      console.error('MP Error:', data);
      return res.status(400).json({ error: 'Error creando preferencia', detail: data });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error interno', detail: error.message });
  }
}
