# Isapre Inteligente

Landing page de captación de leads para comparación de isapres en Chile.

---

## Estructura

```
leadIsapres/
├── public/
│   ├── index.html          ← Página completa
│   ├── css/
│   │   └── style.css       ← Todos los estilos
│   ├── images/
│   │   └── logo.png        ← Logotipo
│   └── js/
│       ├── config.js       ← ⚙️  Configuración (editar aquí)
│       └── main.js         ← Lógica del sitio
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

  // Endpoint de Formspree para recibir leads por email
  // Si lo dejas vacío el formulario redirige directo a WhatsApp
  formspreeEndpoint: 'xxxxxxxxxxxx',

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
Envía datos           Salta directo
a Formspree    ────►  a pantalla de éxito
   │
   ▼
Pantalla de éxito
+ botón WhatsApp con todos los datos pre-cargados
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
| Formulario | Formspree (opcional) + WhatsApp fallback |
| Servidor dev | Node.js built-in `http` (sin dependencias) |

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
