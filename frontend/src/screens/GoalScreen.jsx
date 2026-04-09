import React, { useState, useEffect } from "react";
import { C, fmt } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";
import { portfolioAPI } from "../utils/api.js";
import { Spinner } from "../components/UI.jsx";

export default function GoalsScreen() {
  const { t, lang } = useLang();
  const [goals, setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portfolioAPI.get(lang)
      .then((d) => setGoals(d.goals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={40} /></div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{t.goalsTitle}</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>{t.goalsSub2}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goals.map((g) => {
          const pct       = Math.min(100, ((g.saved / g.target) * 100));
          const remaining = g.target - g.saved;
          const name      = lang === "te" ? g.name_te : lang === "hi" ? g.name_hi : g.name_en;
          return (
            <div key={g.id} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 18, padding: 18,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 30 }}>{g.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>{name || g.name_en}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Target: {g.deadline}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{fmt(g.saved)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>of {fmt(g.target)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: C.bg, borderRadius: 6, height: 8, marginBottom: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: pct + "%",
                  background: g.color || C.saffron,
                  borderRadius: 6, transition: "width 0.8s ease",
                }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: g.color || C.saffron }}>
                  {pct.toFixed(0)}{t.achieved}
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>
                  {fmt(remaining)} {t.remaining}
                </span>
              </div>

              {/* Monthly SIP suggestion */}
              <div style={{ background: C.bg, borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  💡 {t.monthlyNeeded}{" "}
                  <strong style={{ color: C.text }}>{fmt(g.monthlyRequired)}</strong>
                  {t.monthlyNeededSuf}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button style={{
        marginTop: 16, width: "100%", padding: "14px",
        borderRadius: 14, border: `2px dashed ${C.saffron}`,
        background: C.saffronLight, color: C.saffron,
        fontWeight: 700, fontSize: 14, cursor: "pointer",
      }}>
        {t.addGoal}
      </button>
    </div>
  );
}