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
│       ├── config.js       ← ⚙️  Configuración (editar aquí)
│       └── main.js         ← Lógica del sitio
├── supabase/
│   └── functions/
│       └── notify-lead/    ← Edge Function: email al crear un lead
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

Edita **`public/js/config.js`** — es el único archivo que necesitas tocar:

```js
const CONFIG = {

  // Supabase — proyecto donde se guardan los leads y los usuarios del admin
  supabaseUrl: 'https://xyzxyz.supabase.co',
  supabaseAnonKey: 'eyJ...',   // Clave anon/public (segura para el frontend)

  // Número WhatsApp con código de país, sin + ni espacios
  whatsappNumber: 'xxxxxxxxxxx',

  // Datos del footer
  contactEmail: 'xxxxxxx@xxxxxxx.cl',
  contactPhone: '+56 9 XXXX XXXX',
  contactCity:  'Santiago, Chile',

  // Redes sociales — dejar vacío para ocultar el ícono
  socialFacebook:  '',
  socialInstagram: '',

};
```

Si `supabaseUrl`/`supabaseAnonKey` quedan vacíos, el formulario salta directo a WhatsApp sin guardar el lead en base de datos.

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

## Stack

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 puro (variables, grid, flexbox, animaciones) |
| Lógica | Vanilla JS (ES2020+, sin librerías) |
| Animaciones | Intersection Observer API |
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

Publica la carpeta `public/` en cualquier hosting estático:

| Plataforma | Acción |
|---|---|
| **GitHub Pages** | Publica `public/` como rama `gh-pages` |
| **Netlify** | Arrastra `public/` a netlify.com/drop |
| **Vercel** | `npx vercel public/` |
| **Cloudflare Pages** | Directorio raíz: `public` |

---

## Licencia

MIT — Claudio Díaz © 2026
