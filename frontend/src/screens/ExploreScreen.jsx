import React, { useState, useEffect } from "react";
import { C, fmt } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";
import { recommendAPI } from "../utils/api.js";
import { Badge } from "../components/UI.jsx";

const riskColor = { low: C.green, medium: C.amber, high: C.red };
const riskBg    = { low: C.greenLight, medium: C.amberLight, high: C.redLight };

export default function ExploreScreen({ user }) {
  const { t, lang } = useLang();
  const [risk, setRisk]     = useState(user?.risk || "medium");
  const [period, setPeriod] = useState("medium");
  const [amount, setAmount] = useState("");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);

  // SIP calculator state
  const [sipMonthly, setSipMonthly]   = useState(5000);
  const [sipYears, setSipYears]       = useState(3);
  const [sipRate, setSipRate]         = useState(12);
  const [sipResult, setSipResult]     = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await recommendAPI.get({
        risk, period, lang,
        ...(amount ? { amount } : {}),
        ...(user?.goal ? { goal: user.goal } : {}),
      });
      setData(res);
    } catch { /* show error state */ }
    setLoading(false);
  };

  const calcSIP = async () => {
    setCalcLoading(true);
    try {
      const res = await recommendAPI.calculate({ monthly: sipMonthly, years: sipYears, returnRate: sipRate });
      setSipResult(res);
    } catch { /* ignore */ }
    setCalcLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{t.exploreFundsTitle}</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>{t.exploreFundsSub}</p>

      {/* Filter card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
        {/* Risk */}
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13 }}>{t.riskAppetite}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["low", "medium", "high"].map((r) => (
            <button key={r} onClick={() => { setRisk(r); setData(null); }} style={{
              flex: 1, padding: "9px 4px", borderRadius: 10,
              border: `1.5px solid ${risk === r ? riskColor[r] : C.border}`,
              background: risk === r ? riskBg[r] : C.bg,
              color: risk === r ? riskColor[r] : C.muted,
              fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            }}>
              {r === "low" ? "🛡️ " : r === "medium" ? "⚖️ " : "🚀 "}{r}
            </button>
          ))}
        </div>

        {/* Period */}
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13 }}>{t.investPeriod}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { v: "short", l: t.periodShort },
            { v: "medium", l: t.periodMed },
            { v: "long", l: t.periodLong },
          ].map((p) => (
            <button key={p.v} onClick={() => { setPeriod(p.v); setData(null); }} style={{
              flex: 1, padding: "9px 4px", borderRadius: 10,
              border: `1.5px solid ${period === p.v ? C.blue : C.border}`,
              background: period === p.v ? C.blueLight : C.bg,
              color: period === p.v ? C.blue : C.muted,
              fontWeight: 600, fontSize: 11, cursor: "pointer",
            }}>{p.l}</button>
          ))}
        </div>

        {/* Amount */}
        <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13 }}>Monthly Amount (optional)</p>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 5000"
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 10,
            border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none",
            background: C.bg, marginBottom: 14,
          }}
        />

        <button onClick={fetchRecs} disabled={loading} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: loading ? C.border : C.saffron,
          color: loading ? C.muted : "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Loading..." : t.showRec}
        </button>
      </div>

      {/* Results */}
      {data && (
        <div className="animate-fadeInUp">
          {/* SIP projection */}
          {data.sipCalculation && (
            <div style={{ background: C.greenLight, border: `1px solid ${C.green}30`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: C.green }}>📈 SIP Projection</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { l: "Monthly", v: fmt(data.sipCalculation.monthlyInvestment) },
                  { l: "In " + data.sipCalculation.years + " years", v: fmt(data.sipCalculation.estimatedValue) },
                  { l: "Est. Gain", v: "+" + fmt(data.sipCalculation.estimatedGain) },
                ].map((s) => (
                  <div key={s.l} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{s.l}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 800, color: C.green }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk profile badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{data.funds?.length} funds for you</h3>
            <Badge label={risk.toUpperCase() + " RISK"} color={riskColor[risk]} bg={riskBg[risk]} />
          </div>

          {/* Fund cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.funds?.map((f, i) => (
              <div key={f.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 18, padding: 18, position: "relative",
              }}>
                {f.topPick && (
                  <div style={{ position: "absolute", top: 14, right: 14 }}>
                    <Badge label={t.topPick} color={C.purple} bg={C.purpleLight} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                  <div style={{ fontSize: 34, flexShrink: 0 }}>{f.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text, paddingRight: f.topPick ? 80 : 0 }}>{f.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{f.type}</p>
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{f.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { l: t.returns,   v: `${f.returns?.["3y"] ?? "--"}%` },
                    { l: t.minAmount, v: f.minSIP ? fmt(f.minSIP) + "/mo" : fmt(f.minLumpsum) },
                    { l: t.lockIn,    v: f.lockIn || "None" },
                  ].map((s) => (
                    <div key={s.l} style={{ background: C.bg, borderRadius: 10, padding: "8px 10px" }}>
                      <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{s.l}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, fontWeight: 700, color: C.text }}>{s.v}</p>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  border: `1.5px solid ${C.saffron}`, background: C.saffronLight,
                  color: C.saffron, fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  {t.investBtn} {f.name.split(" ")[0]} →
                </button>
              </div>
            ))}
          </div>

          <div style={{
            background: C.amberLight, border: `1px solid #F5C842`,
            borderRadius: 12, padding: "12px 14px", marginTop: 16,
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#7A4F00" }}>{t.disclaimer}</p>
          </div>
        </div>
      )}

      {/* SIP Calculator */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>🧮 {t.sipCalc}</h3>

        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted }}>{t.monthly}</p>
          <input
            type="number" value={sipMonthly}
            onChange={(e) => setSipMonthly(Number(e.target.value))}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", background: C.bg }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted }}>{t.years}</p>
            <input type="number" value={sipYears} onChange={(e) => setSipYears(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", background: C.bg }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted }}>{t.returnRate}</p>
            <input type="number" value={sipRate} onChange={(e) => setSipRate(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", background: C.bg }}
            />
          </div>
        </div>
        <button onClick={calcSIP} disabled={calcLoading} style={{
          width: "100%", padding: "11px", borderRadius: 10, border: "none",
          background: calcLoading ? C.border : C.green,
          color: "#fff", fontWeight: 700, fontSize: 14, cursor: calcLoading ? "not-allowed" : "pointer",
        }}>
          {calcLoading ? "Calculating..." : t.calculate}
        </button>

        {sipResult && (
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { l: t.totalInv,  v: fmt(sipResult.totalInvested) },
              { l: t.estValue,  v: fmt(sipResult.estimatedValue) },
              { l: t.estGain,   v: "+" + fmt(sipResult.estimatedGain) },
            ].map((s) => (
              <div key={s.l} style={{ background: C.greenLight, borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{s.l}</p>
                <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 800, color: C.green }}>{s.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}