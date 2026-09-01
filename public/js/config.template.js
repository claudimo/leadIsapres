/* ══════════════════════════════════════════════════════════
   ISAPRE INTELIGENTE — Configuración
   Plantilla versionada en git. NO pongas credenciales reales aquí.

   public/js/config.js se genera a partir de este archivo + .env
   ejecutando `npm run build` (ver README → Configuración).
══════════════════════════════════════════════════════════ */

const CONFIG = {

  // ── Supabase ──────────────────────────────────────────────
  // Valores tomados de .env (SUPABASE_URL / SUPABASE_ANON_KEY) al generar config.js
  supabaseUrl: '__SUPABASE_URL__',
  supabaseAnonKey: '__SUPABASE_ANON_KEY__',

  // ── WhatsApp ──────────────────────────────────────────────
  // Número con código de país, sin + ni espacios
  whatsappNumber: '56997669017',

  // ── Información de contacto (footer) ─────────────────────
  contactEmail: 'contacto@isapreinteligente.cl',
  contactPhone: '+56 9 XXXX XXXX',
  contactCity: 'Santiago, Chile',

  // ── Redes sociales (deja vacío para ocultar el ícono) ─────
  socialFacebook: '',
  socialInstagram: '',

};
