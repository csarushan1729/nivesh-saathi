const express = require("express");
const router = express.Router();
const fundsData = require("../data/funds.json");

// GET /api/recommend?risk=medium&goal=home&period=medium&amount=10000&lang=en
router.get("/", (req, res) => {
  const { risk = "medium", goal, period, amount, lang = "en" } = req.query;

  let filteredFunds = fundsData.funds;

  // Filter by risk
  const riskMap = { low: ["low"], medium: ["low", "medium"], high: ["low", "medium", "high"] };
  const allowedRisks = riskMap[risk] || riskMap.medium;
  // For strict filtering: only show the selected risk level
  filteredFunds = filteredFunds.filter((f) => f.risk === risk);

  // Filter by goal if provided
  if (goal) {
    const goalRisk = fundsData.goalToRisk[goal];
    if (goalRisk) {
      filteredFunds = fundsData.funds.filter((f) => f.risk === goalRisk);
    }
  }

  // Filter by period
  if (period === "short") {
    filteredFunds = filteredFunds.filter((f) =>
      f.tags.some((t) => ["liquid", "short-term", "fd", "debt"].includes(t)) || f.risk === "low"
    );
  }

  // Limit to max 3 funds
  filteredFunds = filteredFunds.slice(0, 3);

  // Calculate suggested allocation if amount given
  let allocation = null;
  if (amount && !isNaN(Number(amount))) {
    const amt = Number(amount);
    if (filteredFunds.length > 0) {
      allocation = filteredFunds.map((f, i) => {
        const weights = [0.5, 0.3, 0.2];
        return {
          fundId: f.id,
          fundName: f.name,
          suggestedAmount: Math.round(amt * weights[i]),
          percentage: Math.round(weights[i] * 100),
        };
      });
    }
  }

  // SIP calculator
  let sipCalculation = null;
  if (amount && !isNaN(Number(amount))) {
    const monthly = Number(amount);
    const avgReturn = risk === "low" ? 7 : risk === "medium" ? 12 : 17;
    const years = period === "short" ? 1 : period === "long" ? 5 : 3;
    const months = years * 12;
    const r = avgReturn / 100 / 12;
    const futureValue = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    sipCalculation = {
      monthlyInvestment: monthly,
      years,
      expectedReturn: avgReturn,
      estimatedValue: Math.round(futureValue),
      totalInvested: monthly * months,
      estimatedGain: Math.round(futureValue - monthly * months),
    };
  }

  const riskProfile = fundsData.riskProfiles[risk] || fundsData.riskProfiles.medium;

  return res.json({
    funds: filteredFunds.map((f) => ({
      ...f,
      desc: lang === "hi" ? f.desc_hi : f.desc_en,
    })),
    riskProfile: {
      ...riskProfile,
      label: lang === "hi" ? riskProfile.label_hi : riskProfile.label_en,
      description: lang === "hi" ? riskProfile.description_hi : riskProfile.description_en,
    },
    allocation,
    sipCalculation,
    meta: { risk, goal, period, amount, lang },
  });
});

// POST /api/recommend/calculate - SIP calculator
router.post("/calculate", (req, res) => {
  const { monthly, years, returnRate } = req.body;
  if (!monthly || !years) {
    return res.status(400).json({ error: "monthly and years are required" });
  }
  const r = (returnRate || 12) / 100 / 12;
  const months = years * 12;
  const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return res.json({
    monthlyInvestment: monthly,
    years,
    returnRate: returnRate || 12,
    totalInvested: monthly * months,
    estimatedValue: Math.round(fv),
    estimatedGain: Math.round(fv - monthly * months),
    wealthMultiple: (fv / (monthly * months)).toFixed(2),
  });
});

module.exports = router;