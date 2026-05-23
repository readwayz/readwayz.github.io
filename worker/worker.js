/**
 * Cortex Media — Telegram proxy (Cloudflare Worker)
 *
 * Принимает POST с заявкой и пересылает её в Telegram через бота.
 * Токен хранится как секрет, на клиент НЕ попадает.
 *
 * Деплой: см. README.md в корне репозитория.
 *
 * Секреты (Settings → Variables and Secrets → Add secret):
 *   TG_BOT_TOKEN  — токен бота
 *   TG_CHAT_ID    — id чата для уведомлений
 *
 * Переменная окружения (можно задать как plain text):
 *   ALLOWED_ORIGINS — список через запятую: "https://rdwzboost.ru,https://readwayz.github.io"
 */

const MAX_BODY = 8 * 1024;          // 8 KB достаточно для формы
const FIELD_LIMITS = {
  login: 64,
  name: 100,
  telegram: 64,
  discord: 64,
  platform: 64,
  subs: 32,
  link: 500,
  about: 2000
};

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const origin = request.headers.get('origin') || '';
    const isAllowedOrigin = allowed.length === 0 || allowed.includes(origin);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, isAllowedOrigin)
      });
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method not allowed' }, 405, corsHeaders(origin, isAllowedOrigin));
    }
    if (!isAllowedOrigin) {
      return json({ ok: false, error: 'origin not allowed' }, 403, corsHeaders(origin, false));
    }

    // Body
    const cl = parseInt(request.headers.get('content-length') || '0', 10);
    if (cl > MAX_BODY) {
      return json({ ok: false, error: 'payload too large' }, 413, corsHeaders(origin, true));
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid json' }, 400, corsHeaders(origin, true));
    }

    // Honeypot — поле, которое для людей скрыто. Бот заполнит, человек — нет.
    if (typeof data.website === 'string' && data.website.trim().length > 0) {
      // Тихо отвечаем «ок», чтобы бот не понял, что отбили.
      return json({ ok: true }, 200, corsHeaders(origin, true));
    }

    // Sanitize + validate
    const trim = v => (typeof v === 'string' ? v.trim() : '');
    const cap  = (v, max) => v.slice(0, max);

    const entry = {
      login:    cap(trim(data.login),    FIELD_LIMITS.login),
      name:     cap(trim(data.name),     FIELD_LIMITS.name),
      telegram: cap(trim(data.telegram), FIELD_LIMITS.telegram),
      discord:  cap(trim(data.discord),  FIELD_LIMITS.discord),
      platform: cap(trim(data.platform), FIELD_LIMITS.platform),
      subs:     cap(trim(data.subs),     FIELD_LIMITS.subs),
      link:     cap(trim(data.link),     FIELD_LIMITS.link),
      about:    cap(trim(data.about),    FIELD_LIMITS.about),
      createdAt: new Date().toISOString()
    };

    if (!entry.login || !entry.name || !entry.telegram || !entry.platform || !entry.subs || !entry.link) {
      return json({ ok: false, error: 'missing required fields' }, 400, corsHeaders(origin, true));
    }
    if (!/^@?[A-Za-z0-9_]{4,32}$/.test(entry.telegram)) {
      return json({ ok: false, error: 'invalid telegram' }, 400, corsHeaders(origin, true));
    }
    if (!/^https?:\/\/[^\s<>"]{4,500}$/i.test(entry.link)) {
      return json({ ok: false, error: 'invalid link' }, 400, corsHeaders(origin, true));
    }
    if (!entry.telegram.startsWith('@')) entry.telegram = '@' + entry.telegram;

    // Rate limit (1 запрос / 30 сек / IP) через Cache API — без KV, бесплатно.
    const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
    const rlKey = new Request(`https://rl.local/${ip}`, { method: 'GET' });
    const cache = caches.default;
    const recent = await cache.match(rlKey);
    if (recent) {
      return json({ ok: false, error: 'too many requests' }, 429, corsHeaders(origin, true));
    }
    // Запоминаем IP на 30 секунд
    await cache.put(rlKey, new Response('1', {
      headers: { 'Cache-Control': 'max-age=30' }
    }));

    // Send to Telegram
    if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) {
      return json({ ok: false, error: 'bot is not configured' }, 500, corsHeaders(origin, true));
    }

    const tgUser = entry.telegram.replace(/^@/, '');
    const text =
      `🆕 <b>Новая заявка — Cortex Media</b>\n\n` +
      `👤 <b>Login:</b> <code>${esc(entry.login)}</code>\n` +
      `📛 <b>Имя:</b> ${esc(entry.name)}\n` +
      `✈️ <b>Telegram:</b> ${esc(entry.telegram)}\n` +
      (entry.discord ? `💬 <b>Discord:</b> <code>${esc(entry.discord)}</code>\n` : '') +
      `🎬 <b>Платформа:</b> ${esc(entry.platform)}\n` +
      `👥 <b>Подписчики:</b> ${esc(entry.subs)}\n` +
      `🔗 <b>Канал:</b> ${esc(entry.link)}\n` +
      (entry.about ? `\n📝 ${esc(entry.about)}\n` : '') +
      `\n🌐 IP: <code>${esc(ip)}</code>` +
      `\n🕒 ${new Date(entry.createdAt).toLocaleString('ru-RU')}`;

    const reply_markup = {
      inline_keyboard: [[
        { text: '✈️ Написать', url: `https://t.me/${tgUser}` },
        { text: '🔗 Открыть канал', url: entry.link }
      ]]
    };

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TG_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup
        })
      });
      const tg = await tgRes.json();
      if (!tg.ok) {
        return json({ ok: false, error: 'telegram error' }, 502, corsHeaders(origin, true));
      }
      return json({ ok: true }, 200, corsHeaders(origin, true));
    } catch (e) {
      return json({ ok: false, error: 'upstream failed' }, 502, corsHeaders(origin, true));
    }
  }
};

function corsHeaders(origin, allow) {
  return {
    'Access-Control-Allow-Origin': allow ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  })[c]);
}
