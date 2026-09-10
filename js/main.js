/* =========================================================
   LN Xokiyana Attorneys — main.js
   - Navbar scroll state (with hysteresis)
   - Mobile nav drawer
   - Accessible services accordion
   - Reveal on scroll
   - Formspree AJAX submit
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById('navbar');
  if (nav) {
    const applyScrollState = () => {
      const y = window.scrollY;
      if (y > 80) nav.classList.add('is-scrolled');
      else if (y < 40) nav.classList.remove('is-scrolled');
    };
    document.addEventListener('scroll', applyScrollState, { passive: true });
    applyScrollState();
  }

  /* ---------- Mobile nav drawer ---------- */
  const burger = document.querySelector('.hamburger');
  const navLinks = document.getElementById('nav-links');

  const closeDrawer = () => {
    if (!burger || !navLinks) return;
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  };

  const openDrawer = () => {
    if (!burger || !navLinks) return;
    navLinks.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  };

  burger?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });

  // Close when a link is clicked
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', closeDrawer)
  );

  // Close on Escape, return focus to burger
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks?.classList.contains('is-open')) {
      closeDrawer();
      burger?.focus();
    }
  });

  // Close when clicking outside on mobile
  document.addEventListener('click', e => {
    if (!navLinks?.classList.contains('is-open')) return;
    if (navLinks.contains(e.target) || burger?.contains(e.target)) return;
    closeDrawer();
  });

  /* ---------- Services accordion ---------- */
  const serviceButtons = document.querySelectorAll('.service-header');

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.service-item');
      if (!item) return;
      const isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Keyboard: allow arrow up/down between accordion headers
  const headers = Array.from(serviceButtons);
  headers.forEach((btn, i) => {
    btn.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const next = e.key === 'ArrowDown'
        ? headers[(i + 1) % headers.length]
        : headers[(i - 1 + headers.length) % headers.length];
      next.focus();
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && 'IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback / reduced motion: show everything immediately
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Contact form (Formspree AJAX) ---------- */
  const form = document.querySelector('.contact-form');
  const status = form?.querySelector('.form-status');
  const submitBtn = form?.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn?.innerHTML;

  const setStatus = (msg, kind) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('is-error', 'is-success');
    if (kind) status.classList.add(kind);
  };

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    // Native validation first
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const action = form.getAttribute('action') || '';
    if (!action || action.includes('your-form-id')) {
      setStatus('Form endpoint not configured yet. Please email us directly.', 'is-error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';
    }
    setStatus('Sending your message…', null);

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.reset();
        setStatus("Sent — we'll be in touch within 24 hours.", 'is-success');
        if (submitBtn) submitBtn.innerHTML = "Sent ✓";
      } else {
        const data = await res.json().catch(() => ({}));
        const detail = data?.errors?.map(err => err.message).join(' ') ||
          'Something went wrong. Please try again or email us directly.';
        setStatus(detail, 'is-error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    } catch (err) {
      setStatus('Network error. Please check your connection and try again.', 'is-error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });

  /* ---------- Active link highlight on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const setActive = id => {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    };

    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(sec => sectionObserver.observe(sec));
  }
})();