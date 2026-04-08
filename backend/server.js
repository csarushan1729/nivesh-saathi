require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const chatRoute = require("./routes/chat");
const recommendRoute = require("./routes/recommend");
const portfolioRoute = require("./routes/portfolio");
const fundsRoute = require("./routes/funds");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// AI chat gets stricter limit
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: "Chat rate limit exceeded. Please wait a moment." },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/chat", chatLimiter, chatRoute);
app.use("/api/recommend", recommendRoute);
app.use("/api/portfolio", portfolioRoute);
app.use("/api/funds", fundsRoute);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "NiveshSaathi API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   💎 NiveshSaathi Backend Running     ║
  ║   Port: ${PORT}                          ║
  ║   ENV:  ${process.env.NODE_ENV || "development"}                  ║
  ╚════════════════════════════════════════╝
  `);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  WARNING: ANTHROPIC_API_KEY not set in .env file!");
  }
});