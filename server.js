import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Penyimpanan sementara untuk uji coba.
// Catatan: memori ini tidak permanen pada Vercel.
const pendingVideos = new Map();
const pendingLinks = new Map();

async function telegram(method, body) {
if (!TOKEN) {
throw new Error("TELEGRAM_BOT_TOKEN belum diatur");
}

const response = await fetch(
"https://api.telegram.org/bot${TOKEN}/${method}",
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body)
}
);

const result = await response.json();

if (!response.ok || !result.ok) {
throw new Error(
"Telegram API ${method}: ${JSON.stringify(result)}"
);
}

return result;
}

function getVideo(message) {
if (message.video) {
return {
fileId: message.video.file_id,
fileName: message.video.file_name || "video",
mimeType: message.video.mime_type || "video/mp4"
};
}

const doc = message.document;

if (
doc &&
(
(doc.mime_type || "").startsWith("video/") ||
/.(mp4|mov|m4v|webm)$/i.test(doc.file_name || "")
)
) {
return {
fileId: doc.file_id,
fileName: doc.file_name || "video",
mimeType: doc.mime_type || "video/mp4"
};
}

return null;
}

function getShopeeLink(text) {
const urls = (text || "").match(/https?://\S+/gi) || [];

return urls
.map(url => url.replace(/[),.!?]+$/g, ""))
.find(url => /shopee.[a-z.]+|shp.ee/i.test(url)) || null;
}

async function pairAndReply(chatId) {
const video = pendingVideos.get(String(chatId));
const link = pendingLinks.get(String(chatId));

if (!video || !link) return;

pendingVideos.delete(String(chatId));
pendingLinks.delete(String(chatId));

console.log("VIDEO_SHOPEE_PAIR", JSON.stringify({
chatId,
fileName: video.fileName,
fileId: video.fileId,
link
}));

await telegram("sendMessage", {
chat_id: chatId,
text:
"Video dan link Shopee berhasil dipasangkan!\n\n" +
"Video: " + video.fileName + "\n" +
"Link: " + link + "\n\n" +
"Catatan: video sudah terdeteksi, tetapi belum diunduh atau diproses untuk posting."
});
}

app.get("/health", (req, res) => {
res.json({
ok: true,
service: "Affiliate Automation Backend",
telegramConfigured: Boolean(TOKEN)
});
});

app.get("/api/status", (req, res) => {
res.json({
ok: true,
status: "online",
telegramConfigured: Boolean(TOKEN)
});
});

app.post("/telegram/webhook", async (req, res) => {
// Balas Telegram segera agar webhook tidak menunggu proses.
res.status(200).json({ ok: true });

try {
const message = req.body?.message;
const chatId = message?.chat?.id;

if (!message || !chatId) return;

const key = String(chatId);
const text = message.text || message.caption || "";

console.log("TELEGRAM_INCOMING", JSON.stringify({
  chatId,
  messageId: message.message_id,
  hasText: Boolean(text),
  hasVideo: Boolean(getVideo(message))
}));

if (text.startsWith("/start")) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "Affiliate Automation aktif menerima pesan. Backend sudah terhubung."
  });
  return;
}

const video = getVideo(message);
const link = getShopeeLink(text);

if (video) {
  pendingVideos.set(key, video);
  console.log("VIDEO_RECEIVED", video.fileName);
}

if (link) {
  pendingLinks.set(key, link);
  console.log("SHOPEE_LINK_RECEIVED", link);
}

await pairAndReply(chatId);

} catch (error) {
console.error("Telegram error:", error.stack || error.message);
}
});

app.listen(PORT, () => {
console.log("Backend berjalan di port ${PORT}");
});
