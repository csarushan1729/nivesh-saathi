const express = require("express");
const router = express.Router();
const fundsData = require("../data/funds.json");

// GET /api/funds - all funds
router.get("/", (req, res) => {
  const { risk, category, lang = "en" } = req.query;
  let funds = fundsData.funds;
  if (risk) funds = funds.filter((f) => f.risk === risk);
  if (category) funds = funds.filter((f) => f.category === category);
  return res.json({
    funds: funds.map((f) => ({ ...f, desc: lang === "hi" ? f.desc_hi : f.desc_en })),
    total: funds.length,
  });
});

// GET /api/funds/:id
router.get("/:id", (req, res) => {
  const fund = fundsData.funds.find((f) => f.id === req.params.id);
  if (!fund) return res.status(404).json({ error: "Fund not found" });
  return res.json(fund);
});

module.exports = router;