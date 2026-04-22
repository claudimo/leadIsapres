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
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1600;
      const step = Math.ceil(target / (duration / 16));
      let current = 0;
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('es-CL');
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

// ── FAQ accordion ───────────────────────────────────────────
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = btn.classList.contains('active');

      document.querySelectorAll('.faq-question.active').forEach(b => {
        b.classList.remove('active');
        b.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
      });

      if (!isOpen) {
        btn.classList.add('active');
        answer.classList.add('open');
      }
    });
  });
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
  }, 4000);
}

// ── WhatsApp links (cargados desde /api/whatsapp) ───────────
async function initWhatsApp() {
  let waUrl = `https://wa.me/56912345678?text=Hola,%20quiero%20cotizar%20mi%20plan%20de%20Isapre`;
  try {
    const res = await fetch('/api/whatsapp');
    if (res.ok) {
      const data = await res.json();
      if (data.url) waUrl = data.url;
    }
  } catch (_) {}

  const ids = ['whatsappHero', 'whatsappCTA', 'whatsappFooter', 'whatsappSuccess', 'whatsappFab'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.href = waUrl;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
  });
}
initWhatsApp();

// ── Formulario ──────────────────────────────────────────────
(function initForm() {
  const form      = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const successEl = document.getElementById('formSuccess');

  if (!form) return;

  function setError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`error-${fieldId}`);
    if (input)  input.classList.toggle('error', !!msg);
    if (errEl)  errEl.textContent = msg || '';
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(e => { e.textContent = ''; });
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  }

  function validate(data) {
    let valid = true;

    if (!data.nombre || data.nombre.trim().length < 2) {
      setError('nombre', 'Ingresa tu nombre completo'); valid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('email', 'Correo electrónico inválido'); valid = false;
    }
    if (!data.telefono || data.telefono.trim().length < 7) {
      setError('telefono', 'Teléfono inválido'); valid = false;
    }
    if (!data.edad || isNaN(data.edad) || data.edad < 18 || data.edad > 100) {
      setError('edad', 'Edad debe ser entre 18 y 100'); valid = false;
    }
    if (!data.isapre) {
      setError('isapre', 'Selecciona tu isapre actual'); valid = false;
    }
    if (!data.sueldo) {
      setError('sueldo', 'Selecciona un rango de sueldo'); valid = false;
    }
    if (!data.cargas && data.cargas !== '0') {
      setError('cargas', 'Indica cuántas cargas tienes'); valid = false;
    }
    if (!data.region) {
      setError('region', 'Selecciona tu región'); valid = false;
    }

    return valid;
  }

  function setLoading(loading) {
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = loading;
    btnText.style.display    = loading ? 'none' : 'flex';
    btnLoading.style.display = loading ? 'flex' : 'none';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const data = {
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

    if (!validate(data)) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        form.style.display = 'none';
        successEl.style.display = 'block';
        showToast('¡Cotización enviada correctamente!');
      } else {
        showToast(json.message || 'Ocurrió un error. Intenta de nuevo.', true);
        setLoading(false);
      }
    } catch (err) {
      showToast('Error de conexión. Verifica tu internet.', true);
      setLoading(false);
    }
  });

  // Clear error on input
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
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
