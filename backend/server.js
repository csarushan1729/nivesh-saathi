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
const userRoute = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:3000",
  "https://nivesh-saathi.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests. Please try again later." },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Chat rate limit exceeded. Please wait a moment." },
});

app.use("/api/", generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/chat", chatLimiter, chatRoute);
app.use("/api/recommend", recommendRoute);
app.use("/api/portfolio", portfolioRoute);
app.use("/api/funds", fundsRoute);
app.use("/api/users", userRoute);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "NiveshSaathi API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    routes: ["/api/chat", "/api/recommend", "/api/portfolio", "/api/funds", "/api/users"],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    apiKey: process.env.ANTHROPIC_API_KEY ? "configured" : "MISSING - add to .env",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   💎  NiveshSaathi Backend is Running       ║
  ║   🌐  http://localhost:${PORT}                  ║
  ║   🔑  API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ Set" : "❌ MISSING"}                  ║
  ╚══════════════════════════════════════════════╝

  Routes:
    GET  /api/health
    POST /api/chat
    GET  /api/recommend
    GET  /api/funds
    GET  /api/portfolio
    POST /api/users
  `);
});