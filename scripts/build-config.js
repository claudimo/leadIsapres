// Genera public/js/config.js a partir de config.template.js + .env
// Uso: node scripts/build-config.js  (o `npm run build`)
const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..');
const ENV_PATH  = path.join(ROOT, '.env');
const TEMPLATE  = path.join(ROOT, 'public', 'js', 'config.template.js');
const OUTPUT    = path.join(ROOT, 'public', 'js', 'config.js');

function parseEnv(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key   = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  return env;
}

if (!fs.existsSync(ENV_PATH)) {
  console.error('✗ Falta el archivo .env — copia .env.example a .env y completa tus credenciales de Supabase.');
  process.exit(1);
}

const env = { ...parseEnv(fs.readFileSync(ENV_PATH, 'utf8')), ...process.env };

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing  = required.filter((key) => !env[key]);
if (missing.length) {
  console.error(`✗ Falta(n) en .env: ${missing.join(', ')}`);
  process.exit(1);
}

let output = fs.readFileSync(TEMPLATE, 'utf8');
output = output
  .replace('__SUPABASE_URL__', env.SUPABASE_URL)
  .replace('__SUPABASE_ANON_KEY__', env.SUPABASE_ANON_KEY);

fs.writeFileSync(OUTPUT, output);
console.log(`✓ Generado ${path.relative(ROOT, OUTPUT)}`);
