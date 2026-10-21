# SoodiHoodi chat assistant

Two parts:

- `js/chat.js` + `css/chat.css` — the chat bubble on every page. Hidden while `CHAT.endpoint` is empty.
- `chat-worker/worker.js` — a Cloudflare Worker that holds the store knowledge and the Anthropic API key, and calls Claude (`claude-haiku-5-5`).

## Deploy the Worker (Cloudflare dashboard)

1. Workers & Pages → Create → Worker → start from "Hello World", name it `soodihoodi-chat`, Deploy.
2. Edit code → replace everything with `worker.js` → Deploy.
3. Settings → Variables and Secrets → Add → type **Secret**, name `ANTHROPIC_API_KEY`, value = your Anthropic key → Deploy.
4. Copy the Worker URL (`https://soodihoodi-chat.<subdomain>.workers.dev`) into `CHAT.endpoint` in `js/chat.js`, bump `chat.js?v=` in the pages, and push.

## Telegram (alerts and replies)

- Variables on the Worker: `TELEGRAM_BOT_TOKEN` (Secret), `TELEGRAM_CHAT_ID` (Text, the team chat), optional `TELEGRAM_ALERTS` = `all` to be told about every new chat.
- Binding: Workers KV namespace `soodihoodi-chat` bound as `CHAT_KV` (stores team replies for two days).
- After changing the bot token, open `https://soodihoodi-chat.<subdomain>.workers.dev/telegram-connect` once.
- To answer a customer: reply to their alert in Telegram (swipe left). A message that isn't a reply goes to the most recent chat.

## Keep it current

- Prices, editions, delivery or policy change → edit `KNOWLEDGE` in `worker.js` and press Deploy in Cloudflare. No site change needed.
- When an edition name changes on the site (js/data.js), update the EDITIONS list in `KNOWLEDGE` the same day.
- Cost control: set a monthly spend limit in the Anthropic Console. The Worker also caps each visitor at 30 messages per 10 minutes and trims long messages.
