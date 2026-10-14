import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

app.use(cors());
app.use(express.json());

async function telegram(method, body) {
  if (!TOKEN) throw new Error("Telegram token belum diatur");

  const response = await fetch(
    `https://api.telegram.org/bot${TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  return response.json();
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
  res.status(200).json({ ok: true });

  try {
    const message = req.body?.message;
    const chatId = message?.chat?.id;
    const text = message?.text || "";

    if (!chatId) return;

    if (text.startsWith("/start")) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "Affiliate Automation aktif menerima pesan. Backend sudah terhubung."
      });
    }
  } catch (error) {
    console.error("Telegram error:", error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend berjalan di port ${PORT}`);
});
