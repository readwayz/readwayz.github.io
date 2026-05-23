/**
 * Cortex Media — Конфигурация (статическая, для GitHub Pages)
 *
 * Никаких секретов. Заявки уходят через Cloudflare Worker —
 * токен бота и chat_id хранятся на сервере Cloudflare как secret.
 */

window.CORTEX_CONFIG = {
  // URL Cloudflare Worker, принимающего заявки.
  // Получишь его после деплоя воркера (см. README.md → раздел Cloudflare Worker).
  // Пример: 'https://cortex-media.readwayz.workers.dev'
  applyEndpoint: 'https://cortex-media-bot.lolpipiskaboom.workers.dev',

  // ---- Контакты ----
  managerTelegram: 'readwayz',
  supportUrl:      'https://t.me/readwayz',
  discordUrl:      'https://discord.gg/JNMZMmHeRw',
  telegramUrl:     'https://t.me/cortexclient_com',
  mainSiteUrl:     'https://cortexclient.com'
};
