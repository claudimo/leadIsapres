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

  function setOpen(open) {
    links.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setOpen(false));
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
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
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
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
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
    if (input) {
      input.classList.toggle('error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    if (errEl) errEl.textContent = msg || '';
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(e => { e.textContent = ''; });
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
    const summary = document.getElementById('formErrorSummary');
    if (summary) { summary.hidden = true; summary.querySelector('ul').innerHTML = ''; }
  }

  // Etiquetas legibles para el resumen de errores
  const FIELD_LABELS = {
    nombre: 'Nombre completo', email: 'Correo electrónico', telefono: 'Teléfono',
    edad: 'Edad', isapre: 'Isapre actual', sueldo: 'Rango de sueldo',
    cargas: 'Cargas familiares', region: 'Región',
  };

  // Validadores por campo (se usan en blur y en submit)
  const VALIDATORS = {
    nombre:   v => (!v || v.trim().length < 2) ? 'Ingresa tu nombre completo' : '',
    email:    v => (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ? 'Correo electrónico inválido' : '',
    telefono: v => (!v || !isValidClPhone(v)) ? 'Ingresa un teléfono chileno válido, ej: +56 9 1234 5678' : '',
    edad:     v => { const n = parseInt(v, 10); return (!v || isNaN(n) || n < 18 || n > 100) ? 'La edad debe estar entre 18 y 100' : ''; },
    isapre:   v => !v ? 'Selecciona tu isapre actual' : '',
    sueldo:   v => !v ? 'Selecciona un rango de sueldo' : '',
    cargas:   v => (!v && v !== '0') ? 'Indica cuántas cargas tienes' : '',
    region:   v => !v ? 'Selecciona tu región' : '',
  };

  // Acepta números chilenos con o sin +56, con espacios/guiones/paréntesis:
  // móviles (9XXXXXXXX) y fijos (área 2-9 + 7-8 dígitos)
  function isValidClPhone(raw) {
    const cleaned = raw.replace(/[\s\-().]/g, '');
    return /^(\+?56)?[2-9]\d{7,8}$/.test(cleaned);
  }

  function validate() {
    let ok = true;
    Object.keys(VALIDATORS).forEach(id => {
      const el  = form[id];
      const msg = VALIDATORS[id](el ? el.value.trim() : '');
      setError(id, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  // Construye/actualiza el resumen de errores enfocable arriba del formulario
  function updateErrorSummary(moveFocus) {
    const summary = document.getElementById('formErrorSummary');
    const list    = document.getElementById('formErrorSummaryList');
    if (!summary || !list) return;
    const items = Object.keys(VALIDATORS)
      .map(id => ({ id, msg: (document.getElementById(`error-${id}`) || {}).textContent }))
      .filter(x => x.msg);
    if (!items.length) {
      summary.hidden = true;
      list.innerHTML = '';
      return;
    }
    list.innerHTML = items.map(x =>
      `<li><a href="#${x.id}">${FIELD_LABELS[x.id] || x.id}: ${x.msg}</a></li>`).join('');
    summary.hidden = false;
    if (moveFocus) summary.focus();
  }

  // Al pulsar un enlace del resumen, enfoca el campo correspondiente
  document.getElementById('formErrorSummaryList')?.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
  });

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

  // Inicializa cliente Supabase si está configurado
  const sbClient = (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey)
    ? supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey)
    : null;

  async function submitViaSupabase(data) {
    const { error } = await sbClient.from('leads').insert([{
      nombre:   data.nombre,
      email:    data.email,
      telefono: data.telefono,
      edad:     data.edad,
      isapre:   data.isapre,
      sueldo:   data.sueldo,
      cargas:   data.cargas,
      region:   data.region,
      mensaje:  data.mensaje || null,
    }]);
    if (error) throw error;
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

    if (!validate()) {
      updateErrorSummary(true);
      return;
    }

    setLoading(true);

    if (sbClient) {
      try {
        await submitViaSupabase(d);
      } catch (err) {
        console.error('Supabase error:', err);
        showToast('Error al enviar. Intenta contactarnos por WhatsApp.', true);
        setLoading(false);
        return;
      }
    }

    // Mostrar pantalla de éxito
    form.style.display = 'none';
    successEl.style.display = 'block';
    document.getElementById('formSuccessTitle')?.focus();
    showToast('¡Cotización enviada correctamente!');

    // Actualizar enlace WhatsApp del éxito con los datos del formulario
    const waSuccess = document.getElementById('whatsappSuccess');
    if (waSuccess) {
      waSuccess.href = buildWhatsAppUrl(d);
      waSuccess.target = '_blank';
      waSuccess.rel = 'noopener noreferrer';
    }
  });

  // Validación al salir del campo (blur) + limpieza al escribir
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('blur', () => {
      if (!VALIDATORS[el.id]) return;
      setError(el.id, VALIDATORS[el.id](el.value.trim()));
      updateErrorSummary();
    });
    el.addEventListener('input', () => {
      el.classList.remove('error');
      el.setAttribute('aria-invalid', 'false');
      const errEl = document.getElementById(`error-${el.id}`);
      if (errEl) errEl.textContent = '';
      updateErrorSummary();
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
