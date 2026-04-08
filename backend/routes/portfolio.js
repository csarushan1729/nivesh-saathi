const express = require("express");
const router = express.Router();
const portfolioData = require("../data/portfolio.json");

// In-memory store (replace with DB in production)
let portfolio = [...portfolioData.portfolio];
let goals = [...portfolioData.goals];

// GET /api/portfolio
router.get("/", (req, res) => {
  const total = portfolio.reduce((a, b) => a + b.current, 0);
  const invested = portfolio.reduce((a, b) => a + b.invested, 0);
  const gain = total - invested;
  const gainPct = invested > 0 ? ((gain / invested) * 100).toFixed(2) : 0;

  const breakdown = {
    equity: portfolio.filter((f) => ["equity", "elss"].includes(f.category)).reduce((a, b) => a + b.current, 0),
    debt: portfolio.filter((f) => ["liquid", "debt", "fd"].includes(f.category)).reduce((a, b) => a + b.current, 0),
    hybrid: portfolio.filter((f) => f.category === "hybrid").reduce((a, b) => a + b.current, 0),
  };

  return res.json({
    holdings: portfolio,
    summary: {
      totalValue: total,
      totalInvested: invested,
      totalGain: gain,
      gainPercent: Number(gainPct),
      breakdown,
    },
    goals,
  });
});

// GET /api/portfolio/:id
router.get("/:id", (req, res) => {
  const holding = portfolio.find((p) => p.id === req.params.id);
  if (!holding) return res.status(404).json({ error: "Holding not found" });
  const gain = holding.current - holding.invested;
  return res.json({
    ...holding,
    gain,
    gainPercent: ((gain / holding.invested) * 100).toFixed(2),
  });
});

// POST /api/portfolio - Add new holding
router.post("/", (req, res) => {
  const { name, type, category, invested, risk, icon, fundId } = req.body;
  if (!name || !invested) {
    return res.status(400).json({ error: "name and invested amount are required" });
  }
  const newHolding = {
    id: "p" + Date.now(),
    fundId: fundId || null,
    name,
    type: type || "Mutual Fund",
    category: category || "equity",
    invested: Number(invested),
    current: Number(invested),
    risk: risk || "medium",
    icon: icon || "📈",
    startDate: new Date().toISOString().split("T")[0],
  };
  portfolio.push(newHolding);
  return res.status(201).json(newHolding);
});

// PUT /api/portfolio/:id - Update current value
router.put("/:id", (req, res) => {
  const idx = portfolio.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Holding not found" });
  portfolio[idx] = { ...portfolio[idx], ...req.body };
  return res.json(portfolio[idx]);
});

// DELETE /api/portfolio/:id
router.delete("/:id", (req, res) => {
  const idx = portfolio.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Holding not found" });
  portfolio.splice(idx, 1);
  return res.json({ message: "Holding removed successfully" });
});

// GET /api/portfolio/goals/all
router.get("/goals/all", (req, res) => res.json(goals));

// POST /api/portfolio/goals - Add goal
router.post("/goals", (req, res) => {
  const { icon, name_en, name_hi, target, deadline, color } = req.body;
  if (!name_en || !target) return res.status(400).json({ error: "name and target are required" });
  const newGoal = {
    id: "g" + Date.now(),
    icon: icon || "🎯",
    name_en,
    name_hi: name_hi || name_en,
    target: Number(target),
    saved: 0,
    deadline: deadline || "TBD",
    color: color || "#FF6B00",
    monthlyRequired: Math.ceil(Number(target) / 24),
  };
  goals.push(newGoal);
  return res.status(201).json(newGoal);
});

module.exports = router;