// Supabase Edge Function — notifica por email al administrador cuando se crea un lead.
// Se dispara desde un Database Webhook (Database → Webhooks) en INSERT sobre public.leads.
// Requiere los secrets: RESEND_API_KEY, ADMIN_EMAIL, WEBHOOK_SECRET (ver README.md).

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
  if (expectedSecret && req.headers.get('x-webhook-secret') !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await req.json();
  const lead = payload.record;

  if (payload.type !== 'INSERT' || !lead) {
    return new Response('Ignored', { status: 200 });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const adminEmail    = Deno.env.get('ADMIN_EMAIL');

  const rows = [
    ['Nombre', lead.nombre],
    ['Email', lead.email],
    ['Teléfono', lead.telefono],
    ['Edad', lead.edad],
    ['Isapre actual', lead.isapre],
    ['Sueldo', lead.sueldo],
    ['Pago convenio actual', lead.convenio_monto != null ? `${lead.convenio_monto} ${lead.convenio_moneda ?? ''}`.trim() : '—'],
    ['Cargas familiares', lead.cargas],
    ['Región', lead.region],
    ['Mensaje', lead.mensaje || '—'],
  ];

  const html = `
    <h2>Nuevo lead recibido — Isapre Inteligente</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="font-weight:bold;border:1px solid #ddd">${label}</td>
          <td style="border:1px solid #ddd">${value ?? '—'}</td>
        </tr>
      `).join('')}
    </table>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Isapre Inteligente <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `Nuevo lead: ${lead.nombre}`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Resend error:', detail);
    return new Response(detail, { status: 502 });
  }

  return new Response('OK', { status: 200 });
});
