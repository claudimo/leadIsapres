# 🏥 Isapre Inteligente

> Landing page estática de captación de leads. Solo HTML + CSS + JS. Sin backend, sin build, sin dependencias.

---

## Estructura

```
leadIsapres/
└── public/
    ├── index.html          ← Página completa
    ├── css/
    │   └── style.css       ← Todos los estilos
    └── js/
        ├── config.js       ← ⚙️  Configuración (editar aquí)
        └── main.js         ← Lógica del sitio
```

---

## Uso

Abre `public/index.html` directamente en el navegador, o sírvelo con cualquier servidor estático:

```bash
# Con VS Code: instala "Live Server" y haz clic derecho → Open with Live Server

# Con Python
python -m http.server 3000 --directory public

# Con Node (npx, sin instalar nada)
npx serve public
```

---

## Configuración

Edita **`public/js/config.js`** — es el único archivo que necesitas tocar:

```js
const CONFIG = {

  // Endpoint de Formspree para recibir leads por email
  // Regístrate gratis en https://formspree.io, crea un formulario y pega el endpoint
  // Si lo dejas vacío, el botón de éxito redirige directo a WhatsApp
  formspreeEndpoint: '',   // 'https://formspree.io/f/xabc1234'

  // Número WhatsApp con código de país (sin + ni espacios)
  whatsappNumber: '56912345678',

  // Datos del footer
  contactEmail: 'contacto@isapreinteligente.cl',
  contactPhone: '+56 9 XXXX XXXX',
  contactCity:  'Santiago, Chile',

  // Redes sociales (deja vacío para ocultar)
  socialFacebook:  '',     // 'https://facebook.com/tuPagina'
  socialInstagram: '',     // 'https://instagram.com/tuPerfil'
};
```

---

## Flujo del formulario

```
Usuario llena el formulario
        │
        ▼
¿Hay formspreeEndpoint en config.js?
   │                      │
  SÍ                      NO
   │                      │
Envía datos              Salta directo
a Formspree      ────►   a pantalla de éxito
   │
   ▼
Pantalla de éxito
+ botón WhatsApp con todos los datos pre-cargados en el mensaje
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

## Despliegue gratuito

| Plataforma | Comando / Acción |
|---|---|
| **GitHub Pages** | Sube `public/` como rama `gh-pages` |
| **Netlify** | Arrastra la carpeta `public/` a netlify.com/drop |
| **Vercel** | `npx vercel public/` |
| **Cloudflare Pages** | Conecta el repo, directorio raíz: `public` |

---

## Stack

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 puro (variables, grid, flexbox, animaciones) |
| Lógica | Vanilla JS (ES2020+, sin librerías) |
| Animaciones | AOS inline (sin dependencia externa) |
| Íconos | Font Awesome 6 (CDN) |
| Fuentes | Inter — Google Fonts (CDN) |
| Formulario | Formspree (opcional) + WhatsApp fallback |

---

## Licencia

MIT — Claudio Díaz © 2026
