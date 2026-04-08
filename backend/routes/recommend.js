const express = require("express");
const router = express.Router();
const fundsData = require("../data/funds.json");

// GET /api/recommend?risk=medium&goal=home&period=medium&amount=10000&lang=en
router.get("/", (req, res) => {
  const { risk = "medium", goal, period = "medium", amount, lang = "en" } = req.query;

  // Determine effective risk (goal overrides if provided)
  let effectiveRisk = risk;
  if (goal && fundsData.goalToRisk[goal]) {
    effectiveRisk = fundsData.goalToRisk[goal];
  }

  // Filter funds by effective risk
  let filteredFunds = fundsData.funds.filter((f) => f.risk === effectiveRisk);

  // For short-term, prefer liquid/debt/fd funds even in medium/high risk
  if (period === "short") {
    const shortFunds = fundsData.funds.filter((f) =>
      f.tags.some((t) => ["liquid", "short-term", "fd", "debt"].includes(t))
    );
    if (shortFunds.length > 0) filteredFunds = shortFunds;
  }

  // Limit to 3
  filteredFunds = filteredFunds.slice(0, 3);

  // SIP projection calculator
  let sipCalculation = null;
  if (amount && !isNaN(Number(amount))) {
    const monthly = Number(amount);
    const avgReturn = effectiveRisk === "low" ? 7 : effectiveRisk === "medium" ? 12 : 17;
    const years = period === "short" ? 1 : period === "long" ? 5 : 3;
    const months = years * 12;
    const r = avgReturn / 100 / 12;
    const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    sipCalculation = {
      monthlyInvestment: monthly,
      years,
      expectedReturn: avgReturn,
      estimatedValue: Math.round(fv),
      totalInvested: monthly * months,
      estimatedGain: Math.round(fv - monthly * months),
    };
  }

  // Suggested allocation across recommended funds
  let allocation = null;
  if (amount && filteredFunds.length > 0 && !isNaN(Number(amount))) {
    const amt = Number(amount);
    const weights = [0.5, 0.3, 0.2];
    allocation = filteredFunds.map((f, i) => ({
      fundId: f.id,
      fundName: f.name,
      suggestedAmount: Math.round(amt * (weights[i] || 0.2)),
      percentage: Math.round((weights[i] || 0.2) * 100),
    }));
  }

  const riskProfile = fundsData.riskProfiles[effectiveRisk] || fundsData.riskProfiles.medium;
  const descKey = lang === "te" ? "desc_te" : lang === "hi" ? "desc_hi" : "desc_en";
  const labelKey = lang === "te" ? "label_te" : lang === "hi" ? "label_hi" : "label_en";
  const descRiskKey = lang === "te" ? "description_te" : lang === "hi" ? "description_hi" : "description_en";

  return res.json({
    funds: filteredFunds.map((f) => ({
      ...f,
      desc: f[descKey] || f.desc_en,
    })),
    riskProfile: {
      ...riskProfile,
      label: riskProfile[labelKey] || riskProfile.label_en,
      description: riskProfile[descRiskKey] || riskProfile.description_en,
    },
    sipCalculation,
    allocation,
    meta: { risk: effectiveRisk, goal: goal || null, period, amount: amount || null, lang },
  });
});

// POST /api/recommend/calculate — standalone SIP calculator
router.post("/calculate", (req, res) => {
  const { monthly, years, returnRate } = req.body;
  if (!monthly || !years) {
    return res.status(400).json({ error: "monthly and years are required" });
  }
  const m = Number(monthly);
  const y = Number(years);
  const r = (Number(returnRate) || 12) / 100 / 12;
  const months = y * 12;
  const fv = m * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return res.json({
    monthlyInvestment: m,
    years: y,
    returnRate: Number(returnRate) || 12,
    totalInvested: m * months,
    estimatedValue: Math.round(fv),
    estimatedGain: Math.round(fv - m * months),
    wealthMultiple: (fv / (m * months)).toFixed(2),
  });
});

module.exports = router;