import React, { useState, useEffect } from "react";
import { C, fmt } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";
import { portfolioAPI } from "../utils/api.js";
import { Spinner, EmptyState } from "../components/UI.jsx";

const catStyle = {
  equity: { bg: C.blueLight,   color: C.blue   },
  elss:   { bg: C.purpleLight, color: C.purple  },
  liquid: { bg: C.greenLight,  color: C.green   },
  fd:     { bg: C.amberLight,  color: C.amber   },
  debt:   { bg: C.blueLight,   color: C.blue    },
  hybrid: { bg: C.saffronLight,color: C.saffron },
};
const catIcon = { equity: "📈", liquid: "💧", fd: "🏦", elss: "💰", debt: "📊", hybrid: "⚖️" };

export default function PortfolioScreen() {
  const { t, lang } = useLang();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    portfolioAPI.get(lang).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [lang]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={40} /></div>
  );

  if (!data) return (
    <div style={{ padding: 20 }}>
      <EmptyState icon="📉" title="Could not load portfolio" sub="Check that your backend is running on port 5000." />
    </div>
  );

  const { holdings = [], summary = {}, goals = [] } = data;
  const total = summary.totalValue ?? 0;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{t.portfolioTitle}</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>{t.portfolioSub2}</p>

      {/* Summary banner */}
      <div style={{
        background: "linear-gradient(135deg, #00875A, #00AA70)",
        borderRadius: 20, padding: "20px 22px", marginBottom: 16, color: "#fff",
        boxShadow: "0 6px 24px rgba(0,135,90,0.25)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.85 }}>{t.currentValue}</p>
            <h2 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 800 }}>{fmt(summary.totalValue ?? 0)}</h2>
            <div style={{ display: "flex", gap: 22 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, opacity: 0.8 }}>{t.invested2}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{fmt(summary.totalInvested ?? 0)}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, opacity: 0.8 }}>{t.gain}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>+{fmt(summary.totalGain ?? 0)}</p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{t.allReturns}</p>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800 }}>+{summary.gainPercent ?? 0}%</p>
          </div>
        </div>
      </div>

      {/* Two stat cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { l: t.invested2, v: fmt(summary.totalInvested ?? 0) },
          { l: t.gain,       v: "+" + fmt(summary.totalGain ?? 0), color: C.green },
        ].map((s) => (
          <div key={s.l} style={{
            flex: 1, background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "14px 16px",
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: s.color || C.text }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Allocation bar */}
      {holdings.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13 }}>{t.allocation}</p>
          <div style={{ display: "flex", height: 10, borderRadius: 8, overflow: "hidden", gap: 2, marginBottom: 12 }}>
            {holdings.map((f) => {
              const cs = catStyle[f.category] || catStyle.equity;
              return <div key={f.id} style={{ flex: f.current, background: cs.color, opacity: 0.85 }} />;
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {holdings.map((f) => {
              const cs = catStyle[f.category] || catStyle.equity;
              const pct = total > 0 ? ((f.current / total) * 100).toFixed(0) : 0;
              return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cs.color }} />
                  <span style={{ fontSize: 11, color: C.muted }}>{f.name.split(" ")[0]} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Holdings list */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>{t.holdings}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {holdings.map((f) => {
          const g   = f.current - f.invested;
          const gp  = ((g / f.invested) * 100).toFixed(2);
          const cs  = catStyle[f.category] || catStyle.equity;
          const open = selected === f.id;
          return (
            <div key={f.id} style={{
              background: C.card, borderRadius: 16, overflow: "hidden",
              border: `1px solid ${open ? C.saffron : C.border}`,
              transition: "border-color 0.2s",
            }}>
              <button onClick={() => setSelected(open ? null : f.id)} style={{
                width: "100%", padding: "14px 16px", background: "none",
                border: "none", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: cs.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>{f.icon || catIcon[f.category] || "📈"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{f.type}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{fmt(f.current)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: C.green }}>+{gp}%</p>
                </div>
              </button>

              {open && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px", background: C.bg }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[
                      { l: t.invested2,     v: fmt(f.invested) },
                      { l: t.currentValue,  v: fmt(f.current)  },
                      { l: t.gain,          v: "+" + fmt(g)    },
                      { l: t.annualReturns, v: f.returns + "%" },
                    ].map((s) => (
                      <div key={s.l} style={{ background: C.card, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{s.l}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 700 }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: C.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      {t.addMore}
                    </button>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${C.red}`, background: C.redLight, color: C.red, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      {t.withdraw}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}