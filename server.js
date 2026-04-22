require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Nodemailer transport ────────────────────────────────────
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Lead storage ────────────────────────────────────────────
function saveLead(lead) {
  if (process.env.SAVE_LEADS_TO_FILE !== 'true') return;

  const filePath = process.env.LEADS_FILE_PATH || './data/leads.json';
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let leads = [];
  if (fs.existsSync(filePath)) {
    try {
      leads = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
      leads = [];
    }
  }

  leads.push({ ...lead, timestamp: new Date().toISOString() });
  fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
}

// ── Email HTML ──────────────────────────────────────────────
function buildEmailHtml(data) {
  const rows = [
    ['Nombre', data.nombre],
    ['Email', data.email],
    ['Teléfono', data.telefono],
    ['Edad', data.edad],
    ['Isapre actual', data.isapre],
    ['Rango sueldo', data.sueldo],
    ['Cargas familiares', data.cargas],
    ['Región', data.region],
    ['Mensaje', data.mensaje || '—'],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;background:#f1f5f9;font-weight:600;color:#1e293b;width:160px;border-bottom:1px solid #e2e8f0">${label}</td>
        <td style="padding:10px 16px;color:#334155;border-bottom:1px solid #e2e8f0">${value}</td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:32px auto">
      <tr>
        <td style="background:linear-gradient(135deg,#0f172a,#1e40af);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:-0.5px">🏥 Isapre Inteligente</h1>
          <p style="margin:8px 0 0;color:#93c5fd;font-size:14px">Nuevo lead recibido</p>
        </td>
      </tr>
      <tr>
        <td style="background:#fff;padding:0 0 24px;border-radius:0 0 12px 12px;box-shadow:0 4px 24px rgba(0,0,0,.08)">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:none">
            ${tableRows}
          </table>
          <p style="margin:20px 40px 0;font-size:12px;color:#94a3b8;text-align:center">
            Isapre Inteligente &mdash; ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

// ── Validación ──────────────────────────────────────────────
function validateLead(body) {
  const errors = [];

  if (!body.nombre || body.nombre.trim().length < 2) errors.push('Nombre inválido');
  if (!body.email || !validator.isEmail(body.email)) errors.push('Email inválido');
  if (!body.telefono || !/^[\d\s\+\-]{7,15}$/.test(body.telefono)) errors.push('Teléfono inválido');
  if (!body.edad || isNaN(body.edad) || body.edad < 18 || body.edad > 100) errors.push('Edad inválida');
  if (!body.isapre) errors.push('Isapre requerida');
  if (!body.sueldo) errors.push('Rango de sueldo requerido');
  if (!body.cargas && body.cargas !== '0') errors.push('Cargas requeridas');
  if (!body.region) errors.push('Región requerida');

  return errors;
}

// ── Ruta: submit formulario ─────────────────────────────────
app.post('/api/lead', limiter, async (req, res) => {
  const errors = validateLead(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const lead = {
    nombre: validator.escape(req.body.nombre.trim()),
    email: req.body.email.trim().toLowerCase(),
    telefono: req.body.telefono.trim(),
    edad: parseInt(req.body.edad),
    isapre: req.body.isapre,
    sueldo: req.body.sueldo,
    cargas: req.body.cargas,
    region: req.body.region,
    mensaje: req.body.mensaje ? validator.escape(req.body.mensaje.trim()) : '',
    ip: req.ip,
  };

  // Guardar localmente
  try { saveLead(lead); } catch (err) { console.error('[lead] Error al guardar:', err.message); }

  // Enviar email si SMTP está configurado
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.LEAD_EMAIL_TO) {
    try {
      const transporter = createTransport();
      await transporter.sendMail({
        from: process.env.LEAD_EMAIL_FROM || '"Isapre Inteligente" <noreply@isapreinteligente.cl>',
        to: process.env.LEAD_EMAIL_TO,
        subject: `🏥 Nuevo lead: ${lead.nombre} — Isapre Inteligente`,
        html: buildEmailHtml(lead),
      });
    } catch (err) {
      console.error('[email] Error al enviar:', err.message);
    }
  }

  console.log(`[lead] ${new Date().toISOString()} — ${lead.nombre} <${lead.email}>`);
  return res.json({ success: true, message: '¡Cotización enviada! Te contactaremos pronto.' });
});

// ── Ruta: info WhatsApp ─────────────────────────────────────
app.get('/api/whatsapp', (req, res) => {
  const number = process.env.WHATSAPP_NUMBER || '56912345678';
  const msg = process.env.WHATSAPP_MESSAGE || 'Hola,%20quiero%20cotizar%20mi%20plan%20de%20Isapre';
  res.json({ url: `https://wa.me/${number}?text=${msg}` });
});

// ── Fallback SPA ────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🏥  Isapre Inteligente corriendo en http://localhost:${PORT}\n`);
});
