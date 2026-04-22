# 🏥 Isapre Inteligente

> Landing page de captación de leads para asesoría en planes de Isapre. Diseño premium, responsive y con backend Node.js.

---

## Tabla de contenidos

- [Demo y estructura](#demo-y-estructura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración (.env)](#configuración-env)
- [Uso](#uso)
- [Secciones del sitio](#secciones-del-sitio)
- [API](#api)
- [Leads y almacenamiento](#leads-y-almacenamiento)
- [Despliegue en producción](#despliegue-en-producción)

---

## Demo y estructura

```
leadIsapres/
├── public/
│   ├── index.html          ← Landing page completa (HTML5 semántico)
│   ├── css/
│   │   └── style.css       ← Estilos premium con CSS variables
│   └── js/
│       └── main.js         ← Lógica frontend (AOS, formulario, FAQ, counters)
├── data/
│   └── leads.json          ← Leads almacenados localmente (auto-generado)
├── server.js               ← Servidor Express (API REST)
├── package.json
├── .env                    ← Configuración activa (no subir a git)
├── .env.example            ← Plantilla de configuración
└── .gitignore
```

---

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |

---

## Instalación

```bash
# 1. Clonar o descargar el proyecto
cd leadIsapres

# 2. Instalar dependencias
npm install

# 3. Copiar plantilla de configuración
cp .env.example .env

# 4. Editar .env con tus datos (ver sección siguiente)
```

---

## Configuración (.env)

Edita el archivo `.env` con los valores de tu entorno:

```env
# ── Servidor ──────────────────────────────────────────────
PORT=3000
NODE_ENV=production

# ── SMTP (Gmail recomendado con App Password) ─────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password

# ── Destinatario de los leads ─────────────────────────────
LEAD_EMAIL_TO=ventas@isapreinteligente.cl
LEAD_EMAIL_FROM="Isapre Inteligente <noreply@isapreinteligente.cl>"

# ── WhatsApp ──────────────────────────────────────────────
WHATSAPP_NUMBER=56912345678
WHATSAPP_MESSAGE=Hola,%20quiero%20cotizar%20mi%20plan%20de%20Isapre

# ── Rate limiting ─────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000   # 15 minutos
RATE_LIMIT_MAX=10             # max 10 envíos por ventana/IP

# ── Almacenamiento local ──────────────────────────────────
SAVE_LEADS_TO_FILE=true
LEADS_FILE_PATH=./data/leads.json
```

> **Gmail App Password:** ve a tu cuenta Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicación.

---

## Uso

```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

El sitio queda disponible en `http://localhost:3000` (o el puerto configurado en `.env`).

---

## Secciones del sitio

| Sección | Descripción |
|---|---|
| **Navbar** | Sticky con blur backdrop, colapsa a menú hamburguesa en mobile |
| **Hero** | Título, subtítulo, estadísticas animadas y formulario de cotización |
| **Formulario** | 9 campos con validación cliente y servidor, feedback visual |
| **¿Cómo funciona?** | 3 pasos visuales: Formulario → Análisis → Propuesta |
| **Beneficios** | Grid de 6 tarjetas con íconos y colores diferenciados |
| **Isapres** | Grilla con las 8 principales isapres del mercado chileno |
| **CTA WhatsApp** | Banner de llamada a acción con enlace directo a WhatsApp |
| **Testimonios** | 3 tarjetas con reseñas y calificaciones de clientes |
| **FAQ** | Acordeón con 6 preguntas frecuentes |
| **Footer** | Logo, links de navegación, legales, contacto y redes sociales |
| **FAB WhatsApp** | Botón flotante animado visible en todo momento |

---

## API

### `POST /api/lead`

Recibe los datos del formulario, los guarda y envía notificación por email.

**Body (JSON):**

```json
{
  "nombre":   "María González",
  "email":    "maria@correo.cl",
  "telefono": "+56 9 1234 5678",
  "edad":     35,
  "isapre":   "Fonasa",
  "sueldo":   "$600.000 - $900.000",
  "cargas":   "1",
  "region":   "Metropolitana",
  "mensaje":  "Tengo dos hijos menores"
}
```

**Respuesta exitosa:**

```json
{ "success": true, "message": "¡Cotización enviada! Te contactaremos pronto." }
```

**Respuesta con error:**

```json
{ "success": false, "message": "Email inválido, Región requerida" }
```

---

### `GET /api/whatsapp`

Devuelve la URL de WhatsApp configurada en `.env`.

```json
{ "url": "https://wa.me/56912345678?text=Hola,..." }
```

---

## Leads y almacenamiento

Cada envío del formulario genera una entrada en `data/leads.json`:

```json
[
  {
    "nombre": "María González",
    "email": "maria@correo.cl",
    "telefono": "+56912345678",
    "edad": 35,
    "isapre": "Fonasa",
    "sueldo": "$600.000 - $900.000",
    "cargas": "1",
    "region": "Metropolitana",
    "mensaje": "",
    "ip": "::1",
    "timestamp": "2026-04-22T13:59:14.323Z"
  }
]
```

Si `SMTP_USER` y `LEAD_EMAIL_TO` están configurados, también se envía un email con formato HTML al destinatario.

---

## Despliegue en producción

### Railway / Render / Heroku

```bash
# Variables de entorno: configurar en el dashboard de la plataforma
# Script de inicio: npm start
```

### VPS con PM2

```bash
npm install -g pm2
pm2 start server.js --name isapre-inteligente
pm2 save
pm2 startup
```

### Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name isapreinteligente.cl www.isapreinteligente.cl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 (variables, grid, flexbox), Vanilla JS |
| Backend | Node.js + Express 4 |
| Email | Nodemailer (SMTP) |
| Seguridad | express-rate-limit, validator, helmet-ready |
| Fuentes | Inter (Google Fonts) |
| Íconos | Font Awesome 6 |

---

## Seguridad

- Rate limiting por IP: 10 envíos cada 15 minutos (configurable)
- Sanitización de inputs con `validator.escape()`
- Validación tanto en cliente como en servidor
- `.env` excluido de git con `.gitignore`
- Sin dependencias de terceros para estilos o animaciones (AOS inline)

---

## Licencia

MIT — Claudio Díaz © 2026
