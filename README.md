# Isapre Inteligente

Landing page de captación de leads para comparación de isapres en Chile.

---

## Estructura

```
leadIsapres/
├── public/
│   ├── index.html          ← Página completa
│   ├── admin/
│   │   └── index.html      ← Panel de administración (leads + usuarios)
│   ├── css/
│   │   └── style.css       ← Todos los estilos
│   ├── images/
│   │   └── logo.png        ← Logotipo
│   └── js/
│       ├── config.template.js  ← ⚙️  Configuración versionada (editar aquí)
│       ├── config.js           ← Generado por `npm run build` (gitignored)
│       └── main.js             ← Lógica del sitio
├── supabase/
│   ├── functions/
│   │   └── notify-lead/    ← Edge Function: email al crear un lead
│   └── sql/
│       └── rls-policies.sql ← Políticas de seguridad (correr en SQL Editor)
├── scripts/
│   └── build-config.js     ← Genera config.js desde .env + config.template.js
├── .env.example             ← Plantilla de variables de entorno
├── server.js               ← Servidor de desarrollo
├── package.json
└── README.md
```

---

## Inicio rápido

```bash
npm start
# → http://localhost:3000
```

---

## Configuración

`public/js/config.js` **ya no se edita a mano ni se sube a git** — se genera automáticamente a partir de `public/js/config.template.js` + tus credenciales en `.env`. Esto evita commitear las credenciales de Supabase directamente en el repo.

1. Copia `.env.example` a `.env` y completa tus valores (Project Settings → API en supabase.com):
   ```bash
   cp .env.example .env
   ```
   ```
   SUPABASE_URL=https://xyzxyz.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   ```
2. Genera `config.js`:
   ```bash
   npm run build
   ```
   (`npm start` también lo regenera automáticamente antes de levantar el servidor, vía el hook `prestart`.)

Si necesitas cambiar el número de WhatsApp, datos del footer o redes sociales, edita esos campos directamente en **`public/js/config.template.js`** (no son secretos, se versionan en git).

Si `SUPABASE_URL`/`SUPABASE_ANON_KEY` no están definidos, `npm run build` falla con un mensaje claro — así no puedes desplegar por accidente sin credenciales. Si el proyecto Supabase no está configurado en absoluto, el formulario salta directo a WhatsApp sin guardar el lead en base de datos.

**Importante:** el `anonKey` de Supabase está pensado para ser público (viaja al navegador de cualquier visitante) — sacarlo de git no lo hace secreto. La protección real de los datos son las políticas de **Row Level Security** en las tablas `leads` y `profiles` de Supabase, no dónde guardes esta clave.

---

## Flujo del formulario

```
Usuario llena el formulario
        │
        ▼
¿Hay supabaseUrl/supabaseAnonKey en config.js?
   │                      │
  SÍ                      NO
   │                      │
Guarda el lead        Salta directo
en la tabla    ────►  a pantalla de éxito
"leads"
   │
   ▼
Pantalla de éxito
+ botón WhatsApp con todos los datos pre-cargados
   │
   ▼
Edge Function "notify-lead" envía email al admin
   │
   ▼
Lead visible/asignable en el panel /admin
```

---

## Secciones del sitio

| Sección | Descripción |
|---|---|
| **Navbar** | Sticky con blur, menú hamburguesa en mobile |
| **Hero** | Título, stats animados y formulario de cotización |
| **¿Cómo funciona?** | 3 pasos visuales |
| **Beneficios** | Grid de 6 tarjetas |
| **Isapres** | Las 8 principales isapres |
| **CTA WhatsApp** | Banner de llamada a acción |
| **Testimonios** | 3 reseñas de clientes |
| **FAQ** | 6 preguntas frecuentes en acordeón |
| **Footer** | Links, contacto y redes sociales |
| **FAB WhatsApp** | Botón flotante animado |

---

## Diseño

Paleta de marca definida como CSS custom properties en `:root` (arriba de `public/css/style.css`):

| Token | Valor | Rol |
|---|---|---|
| `--petrol` | `#0B426A` | Color primario — confianza. Títulos, navbar, iconos, focus rings |
| `--turquoise` | `#27B8C7` | Salud e innovación. Rellenos y degradados |
| `--turquoise-ink` | `#1A8A96` | Turquesa cuando acompaña texto (contraste AA en texto grande) |
| `--cta` | `#FF7A00` | Llamadas a la acción (botones "Cotizar") |
| `--on-cta` | `#ffffff` | Texto sobre naranja (blanco, por decisión de marca — nota: no alcanza el contraste AA, 2.6:1) |
| `--bg` / `--bg-dark` | `#F3F9FC` / `#E8F2F8` | Fondo limpio y secciones alternas |
| `--text` / `--text-muted` | `#13233A` / `#55697A` | Texto principal y secundario (ambos ≥4.5:1 sobre los fondos) |

Los nombres antiguos `--blue` / `--teal` / `--orange` se mantienen como alias de compatibilidad. El `<style>` del panel admin usa los mismos valores hardcodeados.

- **Botones CTA:** naranja sólido con texto blanco + sombra naranja.
- **WhatsApp:** el botón del hero es *outline* (borde y texto verde sobre blanco); los demás (banner, éxito, FAB) van en verde sólido.
- **Título del hero:** "Plan de Isapre" en turquesa con subrayado naranja (`background-image` en `.gradient-text`).
- **Header del formulario:** degradado petróleo → turquesa.

> `public/images/logo.png` es PNG **RGBA con fondo transparente** (1547×594, recortado al contenido). En el navbar se usa sin recuadro; en el footer conserva un recuadro blanco porque el texto navy del logo no contrasta con el fondo oscuro. El disco interior de la marca sigue siendo blanco (es parte del diseño). El PNG original con fondo blanco quedó respaldado durante la conversión.

Guía de diseño instalada en `.claude/skills/` (skill **ui-ux-pro-max**, vía `npm i -g ui-ux-pro-max-cli && uipro init --ai claude`).

---

## Accesibilidad

- **Skip link** "Saltar al contenido principal" + `<main id="main-content">`.
- **Foco visible** consistente (`:focus-visible`, 2px petróleo) y `prefers-reduced-motion` respetado en landing y admin.
- **Contenido sin JS:** `<html class="no-js">` se cambia a `.js` por un script inline; si el JS falla, las secciones con `[data-aos]` se muestran igual.
- **Formulario:** cada campo con `<label>`, `aria-describedby` y error en `role="alert"`; validación al salir del campo (`blur`); al fallar el envío aparece un **resumen de errores enfocable** (`#formErrorSummary`) con enlaces a cada campo.
- **FAQ:** acordeón con `aria-expanded` / `aria-controls` / `aria-labelledby`.
- **Targets táctiles** ≥44px en navegación y botones.
- **Panel admin:** modales con foco inicial, cierre con `Esc`, focus-trap y `role="dialog"`; tabla de leads ordenable por teclado (`<button>` en las cabeceras) con `aria-sort` reflejando el estado real.
- Imágenes con `width`/`height` para evitar *layout shift*.

---

## Stack

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico (`<main>`, skip link, landmarks) |
| Estilos | CSS3 puro — design tokens en `:root`, grid, flexbox, animaciones |
| Lógica | Vanilla JS (ES2020+, sin librerías) |
| Animaciones | Intersection Observer API + `prefers-reduced-motion` |
| Accesibilidad | Foco visible, `aria-*` en formulario/FAQ/modales, resumen de errores enfocable, `aria-sort` |
| Íconos | Font Awesome 6 (CDN) |
| Fuentes | Inter — Google Fonts (CDN) |
| Formulario | Supabase (tabla `leads`, opcional) + WhatsApp fallback |
| Base de datos / Auth | Supabase (Postgres + Auth + Realtime) |
| Panel admin | `public/admin/index.html` — vanilla JS + Supabase JS client |
| Notificaciones | Supabase Edge Function (`notify-lead`) + Resend |
| Servidor dev | Node.js built-in `http` (sin dependencias) |

---

## Panel de administración

`public/admin/index.html` es un panel privado (login con Supabase Auth) para gestionar leads y usuarios. No requiere build ni backend propio: usa el cliente `@supabase/supabase-js` directo desde el navegador con `CONFIG.supabaseUrl` / `CONFIG.supabaseAnonKey`.

**Tablas que espera en Supabase:**

| Tabla | Uso |
|---|---|
| `leads` | Un registro por envío del formulario (`nombre`, `email`, `telefono`, `edad`, `isapre`, `sueldo`, `cargas`, `region`, `mensaje`, `created_at`, `assigned_to`) |
| `profiles` | Un registro por usuario del panel (`id` = mismo UUID que `auth.users`, `name`, `email`, `role` = `admin` \| `agent`, `active`) |

**Roles:**
- **Admin** — ve todos los leads, puede asignarlos a un agente (`assigned_to`), y crear/editar usuarios en la pestaña **Usuarios**.
- **Agente** — solo ve los leads que tiene asignados.

Las tablas `leads` y `profiles` se actualizan en vivo en el panel vía Supabase Realtime (`postgres_changes`), indicado por el punto verde junto al usuario.

**Crear un usuario nuevo:** el panel llama a `sb.auth.signUp(...)` y luego hace un `upsert` de respaldo en `profiles`. Para que el registro automático funcione (sin depender del upsert de respaldo), crea en Supabase un trigger sobre `auth.users` que inserte en `profiles` al crear la cuenta — si falta, el signup falla con "Database error saving new user".

**Nota:** `signUp` en el navegador cierra la sesión del admin y abre la del usuario nuevo; el panel guarda la sesión del admin antes de crear el usuario y la restaura después, así que no cierra sesión por accidente.

---

## Seguridad de datos (Row Level Security)

El `anonKey` de Supabase (en `config.js`) es público por diseño — viaja al navegador de cualquier visitante. La única barrera real entre ese key y los datos de `leads`/`profiles` son las políticas de **Row Level Security** de Postgres, no dónde guardes el key.

Corre **`supabase/sql/rls-policies.sql`** una vez en el **SQL Editor** del Dashboard de Supabase. Deja configurado:

| Tabla | Regla |
|---|---|
| `leads` | Cualquiera puede **insertar** (lo necesita el formulario público sin login). Solo usuarios autenticados pueden **leer**: admin ve todos, agente solo los suyos (`assigned_to`). Solo admin puede **actualizar** (asignar). Nadie puede eliminar. |
| `profiles` | Cada usuario puede leer/editar su propia fila; admin puede leer/editar todas. Un trigger bloquea que un usuario no-admin se cambie a sí mismo `role` o `active` (evita auto-escalada de privilegios), aunque la política se lo permitiría a nivel de fila. |

El script también crea el trigger `handle_new_user` sobre `auth.users` que inserta el `profile` automáticamente al registrar una cuenta — es el trigger que faltaba y que hacía fallar la creación de usuarios con "Database error saving new user" (ver sección anterior).

El script es idempotente (usa `drop policy/trigger if exists`), así que puedes volver a correrlo si cambias algo. Revísalo antes de ejecutarlo si tus tablas tienen columnas o políticas distintas a las descritas en este README — está escrito en base a las columnas que el código realmente usa (`public/js/main.js` y `public/admin/index.html`), no exportado desde tu base de datos.

---

## Notificación por email al crear un lead

Cada vez que se inserta un lead en Supabase, una Edge Function (`supabase/functions/notify-lead`) envía un correo al administrador usando [Resend](https://resend.com).

**Configuración (una sola vez):**

1. Crea una cuenta gratuita en [resend.com](https://resend.com) y genera una API key.
2. Instala la CLI de Supabase y enlaza el proyecto:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref vvcmimpnfowhnainjvrc
   ```
3. Define los secrets de la función (nunca se exponen al frontend):
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxx
   supabase secrets set ADMIN_EMAIL=claudio.diaz.morales@gmail.com
   supabase secrets set WEBHOOK_SECRET=un-valor-aleatorio-largo
   ```
4. Despliega la función:
   ```bash
   supabase functions deploy notify-lead --no-verify-jwt
   ```
5. En el Dashboard de Supabase, ve a **Database → Webhooks → Create a new hook**:
   - Tabla: `leads`
   - Evento: `INSERT`
   - Tipo: `HTTP Request` → apunta a la URL de la función (`https://<project-ref>.functions.supabase.co/notify-lead`)
   - Agrega el header `x-webhook-secret` con el mismo valor de `WEBHOOK_SECRET` del paso 3.

**Nota:** `onboarding@resend.dev` (remitente por defecto en el código) solo entrega correos a la dirección verificada de tu cuenta Resend. Para enviar desde tu propio dominio (ej. `notificaciones@isapreinteligente.cl`), verifica el dominio en Resend y cambia el campo `from` en `supabase/functions/notify-lead/index.ts`.

---

## Despliegue

Antes de publicar, `public/js/config.js` debe existir y estar generado con las credenciales correctas (`npm run build` — ver [Configuración](#configuración)). Como ese archivo está en `.gitignore`, hay dos formas de lograrlo según el hosting:

| Plataforma | Acción |
|---|---|
| **GitHub Pages** | Corre `npm run build` localmente y publica `public/` (con el `config.js` generado) como rama `gh-pages` |
| **Netlify (drag & drop)** | Corre `npm run build` localmente y arrastra `public/` a netlify.com/drop |
| **Netlify / Vercel / Cloudflare Pages (conectado a git)** | Configura las variables de entorno `SUPABASE_URL` / `SUPABASE_ANON_KEY` en el panel del hosting y usa `npm run build` como build command, con `public/` como directorio de salida |

---

## Licencia

MIT — Claudio Díaz © 2026
