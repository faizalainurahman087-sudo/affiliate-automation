
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Penyimpanan sementara untuk pengujian.
const videos = new Map();
const links = new Map();

async function telegram(method, data) {
  if (!TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diatur");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(
      `Telegram API ${method}: ${JSON.stringify(result)}`
    );
  }

  return result;
}

function detectVideo(message) {
  if (message.video) {
    return {
      fileId: message.video.file_id,
      name: message.video.file_name || "video",
      type: "video"
    };
  }

  const file = message.document;

  if (
    file &&
    (
      (file.mime_type || "").startsWith("video/") ||
      /\.(mp4|mov|m4v|webm)$/i.test(file.file_name || "")
    )
  ) {
    return {
      fileId: file.file_id,
      name: file.file_name || "video",
      type: "document"
    };
  }

  return null;
}

function detectShopeeLink(text) {
  const urls = (text || "").match(/https?:\/\/[^\s]+/gi) || [];

  return (
    urls
      .map(url => url.replace(/[),.!?]+$/g, ""))
      .find(url => /(?:shopee\.[a-z.]+|shp\.ee)/i.test(url)) ||
    null
  );
}

async function processMessage(message) {
  if (!message?.chat?.id) return;

  const chatId = message.chat.id;
  const key = String(chatId);
  const messageText = message.text || message.caption || "";

  if (messageText.startsWith("/start")) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "Affiliate Automation aktif menerima pesan. " +
        "Backend sudah terhubung."
    });
    return;
  }

  const video = detectVideo(message);
  const link = detectShopeeLink(messageText);

  console.log("TELEGRAM_MESSAGE", JSON.stringify({
    chatId,
    messageId: message.message_id,
    hasText: Boolean(messageText),
    hasVideo: Boolean(video),
    hasShopeeLink: Boolean(link)
  }));

  if (video) {
    videos.set(key, video);
    console.log("VIDEO_RECEIVED", video.name);
  }

  if (link) {
    links.set(key, link);
    console.log("SHOPEE_LINK_RECEIVED", link);
  }

  const savedVideo = videos.get(key);
  const savedLink = links.get(key);

  if (!savedVideo || !savedLink) return;

  videos.delete(key);
  links.delete(key);

  console.log("VIDEO_LINK_MATCHED", JSON.stringify({
    chatId,
    videoName: savedVideo.name,
    fileId: savedVideo.fileId,
    link: savedLink
  }));

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "Video dan link Shopee berhasil terdeteksi!\n\n" +
      "Video: " + savedVideo.name + "\n" +
      "Link: " + savedLink + "\n\n" +
      "Status: terdeteksi, belum diunduh atau diposting."
  });
}

app.get("/", (_req, res) => {
  res.send("Affiliate Automation Backend aktif");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Affiliate Automation Backend",
    telegramConfigured: Boolean(TOKEN)
  });
});

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    status: "online",
    telegramConfigured: Boolean(TOKEN)
  });
});

app.post("/telegram/webhook", (req, res) => {
  // Akui update Telegram sebelum memprosesnya.
  res.status(200).json({ ok: true });

  const message = req.body?.message;

  if (!message?.chat) {
    console.log("Webhook diterima tanpa pesan biasa.");
    return;
  }

  processMessage(message).catch(error => {
    console.error(
      "TELEGRAM_PROCESS_ERROR",
      error.stack || error.message
    );
  });
});

// Ekspor aplikasi untuk platform hosting.
export default app;

// Jalankan server lokal, bukan sebagai fungsi Vercel.
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Affiliate Automation berjalan di port ${PORT}`);
  });
}
