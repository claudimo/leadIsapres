/* ══════════════════════════════════════════════════════════
   Isapre Inteligente — main.js
══════════════════════════════════════════════════════════ */

// ── AOS (Animate on Scroll) ─────────────────────────────────
(function initAOS() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('aos-animate'); }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
})();

// ── Navbar scroll ───────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

// ── Mobile menu ─────────────────────────────────────────────
(function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('active', open);
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
})();

// ── Counter animation ───────────────────────────────────────
(function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const step   = Math.ceil(target / (1600 / 16));
      let current  = 0;
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('es-CL');
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(c => observer.observe(c));
})();

// ── FAQ accordion ───────────────────────────────────────────
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('active');
      document.querySelectorAll('.faq-question.active').forEach(b => {
        b.classList.remove('active');
        b.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('active');
        btn.closest('.faq-item').querySelector('.faq-answer').classList.add('open');
      }
    });
  });
})();

// ── WhatsApp links ──────────────────────────────────────────
(function initWhatsApp() {
  const number = CONFIG.whatsappNumber || '56900000000';
  const msg    = encodeURIComponent('Hola, quiero cotizar mi plan de Isapre');
  const url    = `https://wa.me/${number}?text=${msg}`;
  ['whatsappHero','whatsappCTA','whatsappFooter','whatsappSuccess','whatsappFab'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
  });
})();

// ── Redes sociales ──────────────────────────────────────────
(function initSocial() {
  const fbEl = document.getElementById('socialFacebook');
  const igEl = document.getElementById('socialInstagram');
  if (fbEl) {
    if (CONFIG.socialFacebook) fbEl.href = CONFIG.socialFacebook;
    else fbEl.style.display = 'none';
  }
  if (igEl) {
    if (CONFIG.socialInstagram) igEl.href = CONFIG.socialInstagram;
    else igEl.style.display = 'none';
  }
})();

// ── Toast notifications ─────────────────────────────────────
function showToast(message, isError = false) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' error' : ''}`;
  toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .4s, transform .4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 450);
  }, 4500);
}

// ── Formulario ──────────────────────────────────────────────
(function initForm() {
  const form      = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const successEl = document.getElementById('formSuccess');
  if (!form) return;

  function setError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`error-${fieldId}`);
    if (input) input.classList.toggle('error', !!msg);
    if (errEl) errEl.textContent = msg || '';
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(e => { e.textContent = ''; });
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  }

  function validate(d) {
    let ok = true;
    if (!d.nombre || d.nombre.trim().length < 2)
      { setError('nombre',   'Ingresa tu nombre completo'); ok = false; }
    if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      { setError('email',    'Correo electrónico inválido'); ok = false; }
    if (!d.telefono || d.telefono.trim().length < 7)
      { setError('telefono', 'Teléfono inválido'); ok = false; }
    if (!d.edad || isNaN(d.edad) || d.edad < 18 || d.edad > 100)
      { setError('edad',     'Edad debe ser entre 18 y 100'); ok = false; }
    if (!d.isapre)
      { setError('isapre',   'Selecciona tu isapre actual'); ok = false; }
    if (!d.sueldo)
      { setError('sueldo',   'Selecciona un rango de sueldo'); ok = false; }
    if (!d.cargas && d.cargas !== '0')
      { setError('cargas',   'Indica cuántas cargas tienes'); ok = false; }
    if (!d.region)
      { setError('region',   'Selecciona tu región'); ok = false; }
    return ok;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.querySelector('.btn-text').style.display    = loading ? 'none' : 'flex';
    submitBtn.querySelector('.btn-loading').style.display = loading ? 'flex' : 'none';
  }

  // Construye un mensaje WhatsApp con todos los datos del formulario
  function buildWhatsAppUrl(d) {
    const number = CONFIG.whatsappNumber || '56900000000';
    const lines = [
      '🏥 *Nueva cotización — Isapre Inteligente*',
      '',
      `👤 *Nombre:* ${d.nombre}`,
      `📧 *Email:* ${d.email}`,
      `📱 *Teléfono:* ${d.telefono}`,
      `🎂 *Edad:* ${d.edad} años`,
      `🏥 *Isapre actual:* ${d.isapre}`,
      `💰 *Sueldo:* ${d.sueldo}`,
      `👨‍👩‍👧 *Cargas:* ${d.cargas === '0' ? 'Sin cargas' : d.cargas}`,
      `📍 *Región:* ${d.region}`,
      d.mensaje ? `💬 *Mensaje:* ${d.mensaje}` : '',
    ].filter(Boolean).join('\n');
    return `https://wa.me/${number}?text=${encodeURIComponent(lines)}`;
  }

  async function submitViaFormspree(data) {
    const res = await fetch(CONFIG.formspreeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const d = {
      nombre:   form.nombre.value.trim(),
      email:    form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      edad:     parseInt(form.edad.value, 10),
      isapre:   form.isapre.value,
      sueldo:   form.sueldo.value,
      cargas:   form.cargas.value,
      region:   form.region.value,
      mensaje:  form.mensaje.value.trim(),
    };

    if (!validate(d)) {
      form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    // Si hay endpoint Formspree configurado, enviar ahí
    if (CONFIG.formspreeEndpoint) {
      try {
        const ok = await submitViaFormspree(d);
        if (!ok) throw new Error('Formspree error');
      } catch (_) {
        showToast('Error al enviar. Intenta contactarnos por WhatsApp.', true);
        setLoading(false);
        return;
      }
    }

    // Mostrar pantalla de éxito
    form.style.display = 'none';
    successEl.style.display = 'block';
    showToast('¡Cotización enviada correctamente!');

    // Actualizar enlace WhatsApp del éxito con los datos del formulario
    const waSuccess = document.getElementById('whatsappSuccess');
    if (waSuccess) {
      waSuccess.href = buildWhatsAppUrl(d);
      waSuccess.target = '_blank';
      waSuccess.rel = 'noopener noreferrer';
    }
  });

  // Limpiar error al escribir
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errEl = document.getElementById(`error-${el.id}`);
      if (errEl) errEl.textContent = '';
    });
  });
})();

// ── Smooth scroll ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});
