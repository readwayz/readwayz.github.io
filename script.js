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

  /* ---------- Form submit (Telegram only) ---------- */
  const form = document.getElementById('applyForm');
  const formStatus = document.getElementById('formStatus');

  const cfg = window.CORTEX_CONFIG || {};

  const sendToTelegram = async (entry) => {
    if (!cfg.telegramBotToken || !cfg.telegramChatId) {
      console.warn('Telegram bot is not configured in config.js');
      return false;
    }

    const text =
      `🆕 <b>Новая заявка — Cortex Media</b>\n\n` +
      `👤 <b>Login:</b> <code>${escapeHtml(entry.login)}</code>\n` +
      `📛 <b>Имя:</b> ${escapeHtml(entry.name)}\n` +
      `✈️ <b>Telegram:</b> ${escapeHtml(entry.telegram)}\n` +
      (entry.discord ? `💬 <b>Discord:</b> <code>${escapeHtml(entry.discord)}</code>\n` : '') +
      `🎬 <b>Платформа:</b> ${escapeHtml(entry.platform)}\n` +
      `👥 <b>Подписчики:</b> ${escapeHtml(entry.subs)}\n` +
      `🔗 <b>Канал:</b> ${escapeHtml(entry.link)}\n` +
      (entry.about ? `\n📝 ${escapeHtml(entry.about)}\n` : '') +
      `\n🕒 ${new Date(entry.createdAt).toLocaleString('ru-RU')}`;

    const tgUser = (entry.telegram || '').replace(/^@/, '');
    const reply_markup = {
      inline_keyboard: [
        [
          { text: '✈️ Написать', url: `https://t.me/${tgUser}` },
          { text: '🔗 Открыть канал', url: entry.link }
        ]
      ]
    };

    try {
      const res = await fetch(`https://api.telegram.org/bot${cfg.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cfg.telegramChatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup
        })
      });
      const data = await res.json();
      if (!data.ok) console.warn('Telegram error:', data);
      return !!data.ok;
    } catch (e) {
      console.warn('Telegram fetch failed:', e);
      return false;
    }
  };

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[c]);
  }

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
        createdAt: new Date().toISOString()
      };

      const original = btn.innerHTML;
      btn.innerHTML = '<span>Отправляем...</span>';
      btn.disabled = true;
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      const ok = await sendToTelegram(entry);

      if (ok) {
        btn.innerHTML = '<span>✓ Заявка отправлена</span>';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        formStatus.textContent = 'Спасибо! Мы свяжемся с тобой в Telegram в течение 24 часов.';
        formStatus.classList.add('success');
        form.reset();
      } else {
        btn.innerHTML = '<span>Не удалось отправить</span>';
        btn.style.background = 'linear-gradient(135deg, #ff6b6b, #e23c3c)';
        const mgr = cfg.managerTelegram ? '@' + cfg.managerTelegram : '@readwayz';
        formStatus.textContent = `Не получилось отправить заявку. Напиши менеджеру напрямую: ${mgr}`;
        formStatus.classList.add('error');
      }

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3500);
    });
  }
});
