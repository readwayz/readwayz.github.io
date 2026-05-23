# Cortex Media — сайт набора в медиа-команду

Полностью статический сайт для GitHub Pages с формой заявки.
Все заявки уходят прямо в Telegram через бота.

- **Сайт:** `index.html`
- **Конфиг:** `config.js` (всё, что меняется без правки кода)

---

## 🚀 Деплой на GitHub Pages (на аккаунт readwayz)

### Вариант A. Личный сайт `readwayz.github.io`

1. Создай на GitHub репозиторий с именем **`readwayz.github.io`** (специальное имя, даёт сайт по адресу `https://readwayz.github.io/`).
2. Залей в него все файлы проекта.
3. `Settings → Pages → Source: Deploy from a branch → main → /`.
4. Через минуту сайт доступен по:

   ```
   https://readwayz.github.io/
   ```

### Вариант B. Сайт проекта `cortex-media`

1. Создай репозиторий с именем, например, **`cortex-media`**.
2. Залей файлы.
3. `Settings → Pages → main / root`.
4. Сайт откроется по:

   ```
   https://readwayz.github.io/cortex-media/
   ```

### Команды для git

```bash
git init
git add .
git commit -m "init: cortex media site"
git branch -M main
git remote add origin https://github.com/readwayz/readwayz.github.io.git
git push -u origin main
```

---

## 🤖 Telegram-бот

Токен уже прописан в `config.js`. Осталось подставить **chat_id** — это твой numeric ID в Telegram.

### Как получить chat_id

1. Открой своего бота в Telegram и нажми **Start** (или отправь любое сообщение).
2. Открой в браузере:

   ```
   https://api.telegram.org/bot8763202847:AAEEzMmjaKD-WYcPhbehoN_u5i6lqIcMgfM/getUpdates
   ```

3. В ответе найди `"chat":{"id": 123456789, ...}` — это твой chat_id.
4. Открой `config.js` и подставь:

   ```js
   telegramChatId: '123456789'
   ```

5. Commit + push. Готово — все заявки прилетают тебе в личку с кнопками для быстрого ответа.

---

## 📨 Что приходит в бота

Под каждой заявкой две кнопки:
- **✈️ Написать** — открывает чат с кандидатом в Telegram
- **🔗 Открыть канал** — открывает его YouTube / TikTok / Shorts

Пример сообщения:

```
🆕 Новая заявка — Cortex Media

👤 Login: newdoq
📛 Имя: Александр
✈️ Telegram: @somebody
🎬 Платформа: YouTube
👥 Подписчики: 12 000
🔗 Канал: https://youtube.com/@channel

📝 Снимаю Minecraft, ищу команду...

🕒 23.05.2026 16:45

[ ✈️ Написать ]  [ 🔗 Открыть канал ]
```

---

## 🗂 Структура

```
.
├── index.html        — главная страница
├── styles.css        — стили
├── script.js         — фронтенд + отправка в Telegram
├── config.js         — настройки (токен, chat_id, контакты)
├── logotype.svg      — логотип
├── fonts/
│   └── advaken-sans-expanded.ttf
├── .nojekyll         — отключает Jekyll на GitHub Pages
└── README.md
```

---

## 🛠 Локальная разработка

```bash
# любой статический сервер
npx serve .
# или
python -m http.server 5500
```

Затем открыть `http://localhost:5500/`.
