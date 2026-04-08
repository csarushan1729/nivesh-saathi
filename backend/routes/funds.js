const express = require("express");
const router = express.Router();
const fundsData = require("../data/funds.json");

// GET /api/funds?risk=medium&category=equity&lang=en
router.get("/", (req, res) => {
  const { risk, category, lang = "en" } = req.query;
  let funds = [...fundsData.funds];

  if (risk) funds = funds.filter((f) => f.risk === risk);
  if (category) funds = funds.filter((f) => f.category === category);

  const descKey = lang === "te" ? "desc_te" : lang === "hi" ? "desc_hi" : "desc_en";

  return res.json({
    funds: funds.map((f) => ({ ...f, desc: f[descKey] || f.desc_en })),
    total: funds.length,
  });
});

// GET /api/funds/meta — risk profiles and goal mappings
router.get("/meta", (req, res) => {
  return res.json({
    goalToRisk: fundsData.goalToRisk,
    riskProfiles: fundsData.riskProfiles,
  });
});

// GET /api/funds/:id
router.get("/:id", (req, res) => {
  const fund = fundsData.funds.find((f) => f.id === req.params.id);
  if (!fund) return res.status(404).json({ error: "Fund not found" });
  return res.json(fund);
});

module.exports = router;