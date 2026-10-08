import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "Affiliate Automation Backend",
    telegramConfigured:
      Boolean(TELEGRAM_BOT_TOKEN)
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    status: "online",
    telegramConnected:
      Boolean(TELEGRAM_BOT_TOKEN),
    queueLength: 0
  });
});

app.post("/telegram/webhook", (req, res) => {
  console.log(
    "Telegram update diterima:",
    JSON.stringify(req.body, null, 2)
  );

  res.json({
    ok: true
  });
});

app.listen(PORT, () => {
  console.log(
    `Affiliate Automation Backend berjalan di port ${PORT}`
  );
});
