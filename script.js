/* =============================
   Cortex Media — Interactions
   ============================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Navbar shadow on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 30) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(el => {
    const d = el.dataset.delay;
    if (d) el.style.setProperty('--d', `${d}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('.stat-value[data-count]');
  const formatNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1).replace('.0','') + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'K';
    return n.toString();
  };

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const v = Math.floor(target * ease(p));
      el.textContent = (target >= 1000 ? formatNum(v) : v.toLocaleString('ru-RU')) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => counterObs.observe(el));

  /* ---------- Perk hover spotlight + 3d tilt ---------- */
  document.querySelectorAll('.perk').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);

      const cx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const cy = (e.clientY - rect.top - rect.height / 2) / rect.height;
      card.style.transform = `translateY(-8px) perspective(1000px) rotateY(${cx * 4}deg) rotateX(${-cy * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- Req-card 3d tilt ---------- */
  document.querySelectorAll('.req-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const cy = (e.clientY - rect.top - rect.height / 2) / rect.height;
      card.style.transform = `translateY(-6px) perspective(1000px) rotateY(${cx * 5}deg) rotateX(${-cy * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- Magnetic buttons (skipped for nav CTA & icons) ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    if (btn.classList.contains('nav-cta')) return;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2);
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ---------- Parallax for hero card ---------- */
  const heroCard = document.querySelector('.hero-card');
  const heroVisual = document.querySelector('.hero-visual');
  if (heroCard && heroVisual && window.innerWidth > 1000) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      heroCard.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    heroVisual.addEventListener('mouseleave', () => {
      heroCard.style.transform = '';
    });
  }

  /* ---------- Subtle parallax for hero glow on scroll ---------- */
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');
  const glow3 = document.querySelector('.glow-3');
  let lastY = 0;
  let ticking = false;
  document.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (glow1) glow1.style.transform = `translate(0, ${lastY * 0.05}px)`;
        if (glow2) glow2.style.transform = `translate(0, ${lastY * -0.04}px)`;
        if (glow3) glow3.style.transform = `translate(0, ${lastY * 0.03}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ---------- Smooth scroll for anchors (offset) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Mobile burger ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      navLinks.style.cssText = isOpen
        ? 'display:flex;flex-direction:column;position:absolute;top:60px;left:0;right:0;background:rgba(13,10,26,.95);padding:16px;border-radius:18px;border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(18px);'
        : '';
    });
  }

  /* ---------- Form submit (через прокси на Cloudflare Workers) ---------- */
  const form = document.getElementById('applyForm');
  const formStatus = document.getElementById('formStatus');

  const cfg = window.CORTEX_CONFIG || {};

  // Фоллбек: открыть чат с менеджером в Telegram с заполненным сообщением.
  const openManagerChatWithEntry = (entry) => {
    const mgr = (cfg.managerTelegram || 'readwayz').replace(/^@/, '');
    const text =
      `Заявка в Cortex Media\n\n` +
      `Login: ${entry.login}\n` +
      `Имя: ${entry.name}\n` +
      `Telegram: ${entry.telegram}\n` +
      (entry.discord ? `Discord: ${entry.discord}\n` : '') +
      `Платформа: ${entry.platform}\n` +
      `Подписчики: ${entry.subs}\n` +
      `Канал: ${entry.link}\n` +
      (entry.about ? `\nО себе: ${entry.about}\n` : '');
    window.open(`https://t.me/${mgr}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const sendThroughProxy = async (entry) => {
    if (!cfg.applyEndpoint) {
      console.warn('applyEndpoint is not set in config.js');
      return false;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(cfg.applyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        console.warn('proxy error:', res.status, data);
        return false;
      }
      return true;
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('proxy fetch failed:', e);
      return false;
    }
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const entry = {
        login:    (data.login || '').trim(),
        name:     (data.name || '').trim(),
        telegram: (data.telegram || '').trim().replace(/^@?/, '@'),
        discord:  (data.discord || '').trim(),
        platform: (data.platform || '').trim(),
        subs:     (data.subs || '').trim(),
        link:     (data.link || '').trim(),
        about:    (data.about || '').trim(),
        website:  (data.website || '').trim(), // honeypot
        createdAt: new Date().toISOString()
      };

      const original = btn.innerHTML;
      btn.innerHTML = '<span>Отправляем...</span>';
      btn.disabled = true;
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      const ok = await sendThroughProxy(entry);

      if (ok) {
        btn.innerHTML = '<span>✓ Заявка отправлена</span>';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        formStatus.textContent = 'Спасибо! Мы свяжемся с тобой в Telegram в течение 24 часов.';
        formStatus.classList.add('success');
        form.reset();
      } else {
        btn.innerHTML = '<span>Открываю Telegram...</span>';
        const mgr = cfg.managerTelegram ? '@' + cfg.managerTelegram : '@readwayz';
        formStatus.textContent = `Не удалось отправить автоматически. Открываем чат с менеджером ${mgr} с заполненным сообщением — просто нажмите «Отправить».`;
        formStatus.classList.add('error');
        openManagerChatWithEntry(entry);
      }

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3500);
    });
  }
});
