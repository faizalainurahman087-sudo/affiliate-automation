import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "Affiliate Automation Backend",
    telegram: false
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    status: "online",
    telegramConnected: false,
    queueLength: 0
  });
});

app.listen(PORT, () => {
  console.log(
    `Affiliate Automation Backend berjalan di port ${PORT}`
  );
});
