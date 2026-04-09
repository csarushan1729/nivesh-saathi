import React, { useState, useEffect } from "react";
import { C, fmt } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";
import { portfolioAPI } from "../utils/api.js";

const TIPS = {
  en: [
    "💡 SIP started early grows 3x more than a lump sum started late.",
    "💡 Liquid funds beat savings accounts for emergency funds.",
    "💡 ELSS saves tax AND grows money — double benefit!",
    "💡 ₹500/month SIP for 20 years = ₹5 lakh+ at 12% returns.",
    "💡 Don't withdraw SIP during market dips — that's when compounding works best.",
  ],
  hi: [
    "💡 Jaldi shuru ki gayi SIP, late se shuru ki gayi lump sum se 3x zyada badhti hai.",
    "💡 Emergency fund ke liye liquid funds savings account se better hain.",
    "💡 ELSS tax bachata hai AUR paise badhata hai — double fayda!",
    "💡 ₹500/month SIP 20 saal mein 12% returns par ₹5 lakh+ ban sakta hai.",
    "💡 Market dip mein SIP band mat karo — yahi compounding ka best time hai.",
  ],
  te: [
    "💡 Muddu SIP, late ga start chesina lump sum kante 3x ekkuva parostundi.",
    "💡 Emergency fund kosam liquid funds savings account kante better.",
    "💡 ELSS tax save chestundi MARIYU money parostundi — rendo fayida!",
    "💡 ₹500/nela SIP 20 sarla tarvata 12% returns lo ₹5 lakh+ avutundi.",
    "💡 Market dips lo SIP aapakandi — adi compounding ki best time.",
  ],
};

export default function Dashboard({ user, onNav }) {
  const { t, lang } = useLang();
  const [portfolio, setPortfolio] = useState(null);
  const [tip] = useState(Math.floor(Math.random() * 5));

  useEffect(() => {
    portfolioAPI.get(lang).then(setPortfolio).catch(() => {});
  }, [lang]);

  const total    = portfolio?.summary?.totalValue    ?? 61282;
  const invested = portfolio?.summary?.totalInvested ?? 56000;
  const gain     = portfolio?.summary?.totalGain     ?? 5282;
  const gainPct  = portfolio?.summary?.gainPercent   ?? 9.43;
  const holdings = portfolio?.holdings?.slice(0, 3)  ?? [];

  const actions = [
    { icon: "🤖", label: t.askAI,       sub: t.askAISub,    nav: "chat",      bg: C.blueLight,   color: C.blue   },
    { icon: "📊", label: t.exploreFunds,sub: t.exploreSub,  nav: "explore",   bg: C.greenLight,  color: C.green  },
    { icon: "💼", label: t.myPortfolio, sub: t.portfolioSub,nav: "portfolio", bg: C.saffronLight,color: C.saffron},
    { icon: "🎯", label: t.myGoals,     sub: t.goalsSub,    nav: "goals",     bg: C.purpleLight, color: C.purple },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Greeting */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{t.greeting} 👋</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{user?.name || "Investor"}</h2>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#fff", fontWeight: 800,
        }}>
          {(user?.name || "I")[0].toUpperCase()}
        </div>
      </div>

      {/* Portfolio card */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B00 0%, #FF9A3C 100%)",
        borderRadius: 22, padding: "22px 24px", marginBottom: 16, color: "#fff",
        boxShadow: "0 8px 28px rgba(255,107,0,0.28)",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.85 }}>{t.totalPortfolio}</p>
        <h1 style={{ margin: "0 0 16px", fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>{fmt(total)}</h1>
        <div style={{ display: "flex", gap: 28 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{t.totalInvested}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{fmt(invested)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{t.totalGain}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>+{fmt(gain)} ({gainPct}%)</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        {actions.map((a) => (
          <button key={a.nav} onClick={() => onNav(a.nav)} style={{
            background: a.bg, border: "none", borderRadius: 18, padding: "16px 14px",
            textAlign: "left", cursor: "pointer", transition: "transform 0.1s",
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={(e)   => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={(e)=> e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>{a.icon}</div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: a.color }}>{a.label}</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{a.sub}</p>
          </button>
        ))}
      </div>

      {/* Top holdings */}
      {holdings.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>{t.topHoldings}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {holdings.map((f) => {
              const g   = f.current - f.invested;
              const gp  = ((g / f.invested) * 100).toFixed(1);
              return (
                <div key={f.id} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "14px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{f.icon || "📈"}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text }}>{f.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{f.type}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{fmt(f.current)}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: C.green }}>+{gp}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Daily tip */}
      <div style={{
        background: C.amberLight, border: `1px solid #F5C842`,
        borderRadius: 14, padding: "14px 16px",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {t.dailyTip}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#7A4F00", lineHeight: 1.55 }}>
          {(TIPS[lang] || TIPS.en)[tip]}
        </p>
      </div>
    </div>
  );
}