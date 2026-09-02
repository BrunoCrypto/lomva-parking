export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const PHONE_NUMBER_ID = '1302736649588313';
  const ACCESS_TOKEN = 'EAAO6QbfootwBScWZAZA5B9ueLcKla1URXV1ZAKaeoMwWNwW6rdXBrRSGFau301uiFi9eqelO8P0rK3vuzPf71QjLUNNrAI4ZC3R24wz0R6ec8ER5gmP2SyRELzW2zL135XMee807nThkr9vVEzyZA4ZAnmxlPa6oqBH8ZAE5zR3icWWIURzreIZCZBmslSZCTyqBCtxsfWGkyJsktRz60MNtZCntr5AThl8dLeHFZBRRYHiBbpcSWpsfNHtacLfNctPShuWqPEVnYObBLHy2FH9bNYsxYkASCZCpVU8KQ';
  const TO_NUMBER = '5493413238566'; // Tu número Bruno

  try {
    const { nombre, patente, servicio, fecha, turno, empresa, cel, codigo } = req.body;

    const mensaje = `🚛 *Nueva reserva — Lomva Parking*\n\n` +
      `*Servicio:* ${servicio}\n` +
      `*Chofer:* ${nombre}\n` +
      `*Empresa:* ${empresa || 'No especificada'}\n` +
      `*Patente:* ${patente}\n` +
      `*Fecha:* ${fecha}\n` +
      `${turno ? `*Turno:* ${turno}\n` : ''}` +
      `*Celular:* ${cel}\n` +
      `*Código:* ${codigo}\n\n` +
      `Entrá al panel admin para hacer el check-in 👉 https://lomvaparking.com.ar`;

    const response = await fetch(`https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: TO_NUMBER,
        type: 'text',
        text: { body: mensaje }
      })
    });

    const data = await response.json();

    if (data.messages) {
      return res.status(200).json({ ok: true, message_id: data.messages[0].id });
    } else {
      console.error('Meta WA Error:', data);
      return res.status(400).json({ error: 'Error enviando WhatsApp', detail: data });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error interno', detail: error.message });
  }
}
