/**
 * main.js — Greenfield Secondary School
 * Shared JavaScript for all pages
 * Handles: navigation, ticker, scroll effects, gallery lightbox,
 *          counter animation, mobile menu, and scroll-to-top
 */

/* ─────────────────────────────────────────────
   1.  NAVIGATION — sticky scroll + mobile menu
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Mark active nav link based on current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  // Mobile hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ─────────────────────────────────────────────
     2.  SCROLL-TO-TOP BUTTON
  ───────────────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────
     3.  ANIMATED COUNTER (homepage stats)
  ───────────────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800;
    const start    = performance.now();
    const update   = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ─────────────────────────────────────────────
     4.  GALLERY LIGHTBOX
  ───────────────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxClose= document.getElementById('lightbox-close');

  if (lightbox) {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.querySelector('img').src;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    [lightboxClose, lightbox].forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxClose) {
          lightbox.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─────────────────────────────────────────────
     5.  FADE-IN ANIMATION ON SCROLL
  ───────────────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const fadeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => fadeObs.observe(el));
  }

  /* ─────────────────────────────────────────────
     6.  PORTAL TAB SWITCHER (portal-login.html)
  ───────────────────────────────────────────── */
  const portalTabs = document.querySelectorAll('.portal-tab');
  const portalForms = document.querySelectorAll('.portal-form');
  portalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      portalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      portalForms.forEach(form => {
        form.style.display = form.id === target ? 'block' : 'none';
      });
    });
  });

  /* ─────────────────────────────────────────────
     7.  NEWS FILTER (news.html)
  ───────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const newsCards  = document.querySelectorAll('.news-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-filter');
      newsCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        card.style.display = (category === 'all' || cardCat === category) ? 'block' : 'none';
      });
    });
  });

  /* ─────────────────────────────────────────────
     8.  GALLERY FILTER (gallery.html)
  ───────────────────────────────────────────── */
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems      = document.querySelectorAll('.gallery-item');
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        item.style.display = (cat === 'all' || item.getAttribute('data-cat') === cat) ? 'block' : 'none';
      });
    });
  });

});

/* ─────────────────────────────────────────────
   CSS helper — add fade-in styles dynamically
───────────────────────────────────────────── */
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .fade-in {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .filter-btn, .gallery-filter-btn {
      padding: 8px 20px;
      border: 1.5px solid var(--border);
      border-radius: 20px;
      background: none;
      font-family: 'Poppins', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-mid);
      transition: var(--transition);
    }
    .filter-btn.active, .gallery-filter-btn.active,
    .filter-btn:hover, .gallery-filter-btn:hover {
      background: var(--green-dark);
      border-color: var(--green-dark);
      color: #fff;
    }
    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 36px;
    }
  `;
  document.head.appendChild(style);
})();
