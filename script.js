// script.js — Dental Art Yerevan

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------
     1. TRANSLATION INJECTION
     ----------------------------------------------- */
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    if (!T || !T[key]) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = T[key];
    } else if (el.tagName === 'OPTION') {
      el.textContent = T[key];
      if (!el.value) el.value = T[key];
    } else {
      el.textContent = T[key];
    }
  });

  /* -----------------------------------------------
     2. FOOTER YEAR
     ----------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------
     3. STICKY HEADER
     ----------------------------------------------- */
  const header = document.getElementById('site-header');

  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* -----------------------------------------------
     4. MOBILE MENU
     ----------------------------------------------- */
  const hamburgerBtn  = document.getElementById('hamburger-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const mobileCloseBtn= document.getElementById('mobile-close-btn');

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMenu);

  // Close on nav link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  /* -----------------------------------------------
     5. SCROLL ANIMATIONS (IntersectionObserver)
     ----------------------------------------------- */
  const animEls = document.querySelectorAll('.fade-in-up');

  // Reduce motion for users who prefer it
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );

    animEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 0.08}s`;
      observer.observe(el);
    });
  } else {
    animEls.forEach(el => el.classList.add('visible'));
  }

  /* -----------------------------------------------
     6. SMOOTH SCROLL for anchor links
     ----------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      // Close mobile menu first if open
      if (mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------------
     7. CONTACT FORM
     ----------------------------------------------- */
  const form        = document.getElementById('contact-form');
  const formFields  = document.getElementById('form-fields');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Basic validation
      const name    = form.querySelector('#f-name');
      const email   = form.querySelector('#f-email');
      const consent = form.querySelector('#f-consent');

      let valid = true;

      [name, email].forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#e05555';
          valid = false;
        }
      });

      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = '#e05555';
        valid = false;
      }

      if (!consent.checked) {
        consent.parentElement.style.outline = '2px solid #e05555';
        consent.parentElement.style.outlineOffset = '4px';
        valid = false;
      } else {
        consent.parentElement.style.outline = '';
      }

      if (!valid) return;

      // Show success
      formFields.style.display = 'none';
      formSuccess.classList.add('show');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

});
