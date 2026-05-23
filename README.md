# Cortex Media — сайт набора в медиа-команду

Полностью статический сайт для GitHub Pages с формой заявки.
Заявки уходят в Telegram через бота **через прокси Cloudflare Workers** —
токен и chat_id хранятся как секреты на сервере и **на клиент не попадают**.

- **Сайт:** `index.html`
- **Конфиг:** `config.js`
- **Прокси:** `worker/worker.js` (Cloudflare Worker)

---

## 🚀 Деплой на GitHub Pages

```bash
git init
git add .
git commit -m "init: cortex media site"
git branch -M main
git remote add origin https://github.com/readwayz/readwayz.github.io.git
git push -u origin main
```

Затем `Settings → Pages → Source: main / root`. Сайт откроется на `https://readwayz.github.io/`
или на твоём домене, если подключен.

---

## 🔐 Безопасность: Cloudflare Worker (один раз)

### Зачем

Чтобы токен бота **не попадал в исходники сайта**. Кто угодно может открыть DevTools и
посмотреть JS — поэтому никаких секретов на клиенте быть не должно. Worker принимает
заявку на свой URL, проверяет, что запрос пришёл с твоего домена, валидирует данные и
сам зовёт Telegram API. Токен живёт только в окружении Cloudflare.

### Шаги

1. Зарегайся на https://dash.cloudflare.com (бесплатно).
2. Слева: **Workers & Pages → Create application → Create Worker**.
3. Имя: например `cortex-media` → **Deploy** (создастся пустой worker).
4. После деплоя зайди в worker → **Edit code** → удали всё, вставь содержимое файла
   `worker/worker.js` из этого репо → **Save and deploy**.
5. **Settings → Variables and Secrets → Add → Type: Secret**:
   - `TG_BOT_TOKEN` = `8763202847:AAEEzMmjaKD-WYcPhbehoN_u5i6lqIcMgfM`
   - `TG_CHAT_ID`   = `1041601126`
6. Там же добавь обычную переменную (Type: Plain text):
   - `ALLOWED_ORIGINS` = `https://rdwzboost.ru,https://readwayz.github.io`

   (можно перечислить любые домены, с которых разрешена форма; через запятую)
7. Скопируй URL воркера — выглядит как `https://cortex-media.readwayz.workers.dev`.
8. Открой `config.js` в репозитории и впиши его в поле `applyEndpoint`:

   ```js
   applyEndpoint: 'https://cortex-media.readwayz.workers.dev',
   ```

9. `git add . && git commit -m "set worker endpoint" && git push`

Проверь форму на сайте — заявка должна прийти боту.

### Что защищает Worker

- **Origin check** — отвергает запросы с чужих доменов.
- **Rate limit** — 1 заявка с одного IP в 30 сек.
- **Honeypot** — скрытое поле `website`. Боты заполняют → заявка тихо отбрасывается.
- **Sanitize / limits** — обрезка длин полей, валидация Telegram-ника и URL канала.

---

## 🤖 Если бот сменил токен

Просто обнови секрет `TG_BOT_TOKEN` в Workers & Pages → твой worker → Settings.
Менять что-то в репозитории не нужно.

---

## 📨 Формат сообщения в Telegram

```
🆕 Новая заявка — Cortex Media

👤 Login: newdoq
📛 Имя: Александр
✈️ Telegram: @somebody
🎬 Платформа: YouTube
👥 Подписчики: 12 000
🔗 Канал: https://youtube.com/@channel

📝 Снимаю Minecraft, ищу команду...

🌐 IP: 1.2.3.4
🕒 23.05.2026 16:45

[ ✈️ Написать ]  [ 🔗 Открыть канал ]
```

---

## 🗂 Структура

```
.
├── index.html
├── styles.css
├── script.js
├── config.js               — applyEndpoint и контакты
├── logotype.svg
├── fonts/
│   └── advaken-sans-expanded.ttf
├── worker/
│   └── worker.js           — Cloudflare Worker (прокси к Telegram)
├── .nojekyll
├── .gitignore
└── README.md
```

Папка `worker/` нужна только как исходник для копипаста в Cloudflare. На сайт она не
влияет — GitHub Pages раздаёт корень репозитория.

---

## 🛠 Локальная разработка

```bash
npx serve .
# или
python -m http.server 5500
```

Открыть `http://localhost:5500/`. Чтобы форма работала локально — добавь
`http://localhost:5500` в `ALLOWED_ORIGINS` воркера.
