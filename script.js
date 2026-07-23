/* ============================================================
   Dr. Raman Dental Health Centre — Website Script
   ============================================================ */

'use strict';

// ---- Utility ----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// NAVBAR — scroll & mobile toggle
// ============================================================
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');

  // Scroll shrink
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    // Back-to-top visibility
    const btn = $('#backToTop');
    btn.hidden = window.scrollY < 400;
  }, { passive: true });

  // Mobile toggle
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on nav link click
  $$('.nav-link, .nav-cta', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Active link highlight on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        const active = $(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
})();

// ============================================================
// BACK TO TOP
// ============================================================
(function initBackToTop() {
  const btn = $('#backToTop');
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============================================================
// REVEAL ON SCROLL (Intersection Observer)
// ============================================================
(function initReveal() {
  const revealEls = $$('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = $$('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => obs.observe(el));
})();

// ============================================================
// RATING BAR ANIMATION
// ============================================================
(function initRatingBars() {
  const bars = $$('.bar-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const w = entry.target.dataset.width || '0';
        entry.target.style.width = w + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => obs.observe(b));
})();

// ============================================================
// AUTOMATED SIDE-BY-SIDE GALLERY TOUR CAROUSEL
// ============================================================
(function initTourCarousel() {
  const track = $('#tourTrack');
  const viewport = $('#tourViewport');
  const prevBtn = $('#tourPrevBtn');
  const nextBtn = $('#tourNextBtn');
  const dotsContainer = $('#tourDots');
  const filterBtns = $$('.filter-btn');
  const slides = $$('.tour-slide');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  let autoTimer = null;
  let activeFilter = 'all';
  let visibleSlides = [...slides];

  function getPerView() {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  function getMaxIndex() {
    const perView = getPerView();
    return Math.max(0, visibleSlides.length - perView);
  }

  function renderDots() {
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.className = `tour-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide position ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    if (currentIndex < 0) currentIndex = 0;

    const perView = getPerView();
    const slideWidth = visibleSlides[0] ? visibleSlides[0].getBoundingClientRect().width : 0;
    const gap = 24;
    const offset = currentIndex * (slideWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Update dots
    const dots = $$('.tour-dot', dotsContainer);
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = maxIdx;
    } else {
      currentIndex--;
    }
    updateCarousel();
  }

  function startTimer() {
    stopTimer();
    autoTimer = setInterval(nextSlide, 3500);
  }

  function stopTimer() {
    if (autoTimer) clearInterval(autoTimer);
  }

  function resetTimer() {
    stopTimer();
    startTimer();
  }

  // Prev / Next click handlers
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });

  // Pause auto-play on mouse hover & touch
  viewport.addEventListener('mouseenter', stopTimer);
  viewport.addEventListener('mouseleave', startTimer);
  viewport.addEventListener('touchstart', stopTimer, { passive: true });

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      visibleSlides = [];
      slides.forEach(slide => {
        const cat = slide.dataset.category;
        if (activeFilter === 'all' || cat === activeFilter) {
          slide.style.display = 'block';
          visibleSlides.push(slide);
        } else {
          slide.style.display = 'none';
        }
      });

      currentIndex = 0;
      renderDots();
      updateCarousel();
      resetTimer();
    });
  });

  window.addEventListener('resize', () => {
    renderDots();
    updateCarousel();
  });

  // Init
  renderDots();
  updateCarousel();
  startTimer();
})();

// ============================================================
// GALLERY LIGHTBOX
// ============================================================
(function initLightbox() {
  const lightbox     = $('#lightbox');
  const lightboxImg  = $('#lightboxImg');
  const lightboxCap  = $('#lightboxCaption');
  const closeBtn     = $('#lightboxClose');
  const prevBtn      = $('#lightboxPrev');
  const nextBtn      = $('#lightboxNext');

  const items = $$('.gallery-item');
  let currentIndex = 0;

  function getVisibleItems() {
    return items.filter(i => i.style.display !== 'none');
  }

  function showImage(idx) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = (idx + visible.length) % visible.length;
    const item = visible[currentIndex];
    const img = $('img', item);
    lightboxImg.src  = img.src;
    lightboxImg.alt  = img.alt;
    lightboxCap.textContent = img.alt || '';
    lightboxImg.style.animation = 'none';
    requestAnimationFrame(() => { lightboxImg.style.animation = ''; });
  }

  function openLightbox(idx) {
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    showImage(idx);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const visible = getVisibleItems();
      const visibleIdx = visible.indexOf(item);
      openLightbox(visibleIdx >= 0 ? visibleIdx : 0);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showImage(currentIndex - 1);
    if (e.key === 'ArrowRight')  showImage(currentIndex + 1);
  });
})();

// ============================================================
// TODAY HIGHLIGHT IN HOURS TABLE
// ============================================================
(function initHoursTable() {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const today = days[new Date().getDay()];
  const rows = $$('#hoursTableBody tr');
  rows.forEach((row, i) => {
    if (days[i === 6 ? 6 : i] === today || row.cells[0]?.textContent.toLowerCase() === today) {
      row.classList.add('today-row');
    }
  });

  // Map day index to table row
  const dayIdx = new Date().getDay(); // 0=Sun, 1=Mon…
  // Row order: Mon=0, Tue=1, … Sun=6
  const rowIdx = dayIdx === 0 ? 6 : dayIdx - 1;
  if (rows[rowIdx]) {
    rows.forEach(r => r.classList.remove('today-row'));
    rows[rowIdx].classList.add('today-row');
  }
})();

// ============================================================
// APPOINTMENT FORM (mock submit)
// ============================================================
(function initForm() {
  const form    = $('#appointmentForm');
  const success = $('#formSuccess');
  const btn     = $('#submitAppointmentBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Simple validation
    const name  = $('#patientName').value.trim();
    const phone = $('#patientPhone').value.trim();

    if (!name) {
      shakeField('#patientName');
      return;
    }
    if (!phone || phone.length < 6) {
      shakeField('#patientPhone');
      return;
    }

    // Loading state
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate network delay
    await delay(1400);

    // Show success
    form.hidden = true;
    success.hidden = false;
  });

  function shakeField(selector) {
    const el = $(selector);
    el.style.animation = 'none';
    requestAnimationFrame(() => {
      el.style.animation = 'shake .4s ease';
      el.focus();
    });
  }

  // Inject shake keyframe if not present
  if (!document.getElementById('shakeStyle')) {
    const style = document.createElement('style');
    style.id = 'shakeStyle';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
    `;
    document.head.appendChild(style);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();

// ============================================================
// SMOOTH COUNTER ANIMATION for hero stats
// ============================================================
(function initCounters() {
  const statsEl = $('.hero-stats');
  if (!statsEl) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter($('.stat-num', entries[0].target.parentElement));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(statsEl);

  function animateCounter(el) {
    if (!el) return;
    // Already handled by CSS; just add class for glow effect
    el.classList.add('counted');
  }
})();

// ============================================================
// PARALLAX SUBTLE on Hero shapes (only on desktop)
// ============================================================
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const shapes = $$('.shape');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    shapes.forEach((s, i) => {
      const speed = [0.15, 0.08, 0.12][i] || 0.1;
      s.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
})();

// ============================================================
// HERO FLOAT CARD entrance
// ============================================================
(function initFloatCard() {
  const card = $('.hero-float-card');
  if (!card) return;
  setTimeout(() => {
    card.style.transition = 'opacity .8s ease, transform .8s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(-50%)';
  }, 600);
  card.style.opacity = '0';
  card.style.transform = 'translateY(-30%)';
})();

// ============================================================
// NAV LINK ACTIVE STYLE (add CSS rule dynamically)
// ============================================================
(function addNavActiveStyle() {
  if (!document.getElementById('navActiveStyle')) {
    const style = document.createElement('style');
    style.id = 'navActiveStyle';
    style.textContent = `.nav-link.active { color: var(--clr-primary) !important; }`;
    document.head.appendChild(style);
  }
})();

console.log('%c🦷 Dr. Raman Dental Health Centre', 'color:#0ea5e9; font-size:1.2rem; font-weight:bold;');
console.log('%cWebsite loaded successfully.', 'color:#10b981;');
