import React, { useState } from "react";
import { C } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";
import { userAPI } from "../utils/api.js";

// ── Reusable choice button ────────────────────────────────────────────────────
function ChoiceBtn({ label, sub, selected, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "13px 16px", borderRadius: 14, textAlign: "left",
      border: `1.5px solid ${selected ? C.saffron : C.border}`,
      background: selected ? C.saffronLight : C.card,
      cursor: "pointer", transition: "all 0.15s",
      display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
    }}>
      {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: selected ? C.saffron : C.text }}>{label}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{sub}</p>}
      </div>
      {selected && <span style={{ marginLeft: "auto", fontSize: 18 }}>✓</span>}
    </button>
  );
}

// ── Next button ───────────────────────────────────────────────────────────────
function NextBtn({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", marginTop: 8, padding: "14px", borderRadius: 14, border: "none",
      background: disabled ? C.border : C.saffron,
      color: disabled ? C.muted : "#fff",
      fontSize: 16, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.2s",
    }}>
      {label}
    </button>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function Progress({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 4,
          background: i < step ? C.saffron : i === step ? C.saffronLight : C.border,
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ── SCREEN 0: Splash ──────────────────────────────────────────────────────────
function SplashScreen({ onStart }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #FFF5EE 0%, #FFFFFF 45%, #EEF4FF 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 24px", textAlign: "center",
    }}>
      {/* Logo mark */}
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 52, marginBottom: 24,
        boxShadow: "0 12px 40px rgba(255,107,0,0.3)",
      }}>
        💎
      </div>

      <h1 style={{
        fontSize: 36, fontWeight: 800, color: C.text,
        margin: "0 0 8px", letterSpacing: -0.5,
      }}>
        Nivesh<span style={{ color: C.saffron }}>Saathi</span>
      </h1>

      <p style={{ fontSize: 16, color: C.muted, margin: "0 0 8px", fontWeight: 500 }}>
        Your AI Investment Friend
      </p>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 40px" }}>
        Smart investing for every Indian 🇮🇳
      </p>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
        {["🤖 AI-Powered Advice", "📊 Curated Funds", "🎯 Goal Planning", "💬 3 Languages"].map((f) => (
          <span key={f} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: C.card, border: `1px solid ${C.border}`, color: C.textSec,
          }}>{f}</span>
        ))}
      </div>

      <button onClick={onStart} style={{
        width: "100%", maxWidth: 320, padding: "16px",
        borderRadius: 16, border: "none",
        background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
        color: "#fff", fontSize: 17, fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(255,107,0,0.35)",
      }}>
        Get Started →
      </button>

      <p style={{ fontSize: 11, color: C.muted, marginTop: 16 }}>
        🔒 Free to use · No credit card required
      </p>
    </div>
  );
}

// ── SCREEN 1: Name ────────────────────────────────────────────────────────────
function NameStep({ data, update, onNext, t }) {
  return (
    <div className="animate-fadeInUp">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{t.step1Q}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{t.step1Sub}</p>
      <input
        value={data.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder={t.step1Ph}
        onKeyDown={(e) => e.key === "Enter" && data.name.trim() && onNext()}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          border: `1.5px solid ${data.name ? C.saffron : C.border}`,
          fontSize: 16, outline: "none", background: C.bg, marginBottom: 4,
          transition: "border-color 0.2s",
        }}
      />
      <NextBtn onClick={onNext} disabled={!data.name.trim()} label={t.next} />
    </div>
  );
}

// ── SCREEN 2: Language ────────────────────────────────────────────────────────
function LanguageStep({ data, update, onNext, t, setLang }) {
  const langs = [
    { code: "en", flag: "🇬🇧", name: "English",            sub: "App & AI in English" },
    { code: "hi", flag: "🇮🇳", name: "हिन्दी (Hinglish)",    sub: "AI answers in Hinglish" },
    { code: "te", flag: "🏳️", name: "తెలుగు (Tenglish)",  sub: "AI answers in Tenglish" },
  ];
  return (
    <div className="animate-fadeInUp">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{t.selectLang}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{t.selectLangSub}</p>
      {langs.map((l) => (
        <ChoiceBtn
          key={l.code}
          icon={l.flag}
          label={l.name}
          sub={l.sub}
          selected={data.language === l.code}
          onClick={() => { update("language", l.code); setLang(l.code); }}
        />
      ))}
      <NextBtn onClick={onNext} disabled={!data.language} label={t.next} />
    </div>
  );
}

// ── SCREEN 3: Profession ──────────────────────────────────────────────────────
function ProfessionStep({ data, update, onNext, t }) {
  const profs = [
    { v: "student",    l: t.profStudent },
    { v: "salaried",   l: t.profSalaried },
    { v: "self",       l: t.profSelf },
    { v: "business",   l: t.profBusiness },
    { v: "homemaker",  l: t.profHomemaker },
    { v: "retired",    l: t.profRetired },
  ];
  return (
    <div className="animate-fadeInUp">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{t.step2Q}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{t.step2Sub}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        {profs.map((p) => (
          <button key={p.v} onClick={() => { update("profession", p.v); onNext(); }} style={{
            padding: "14px 10px", borderRadius: 14, border: `1.5px solid ${data.profession === p.v ? C.saffron : C.border}`,
            background: data.profession === p.v ? C.saffronLight : C.card,
            color: data.profession === p.v ? C.saffron : C.text,
            fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
          }}>
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── SCREEN 4: Investment Range ────────────────────────────────────────────────
function RangeStep({ data, update, onNext, t }) {
  const ranges = [
    { v: "upto500",   l: t.range1 },
    { v: "500-1000",  l: t.range2 },
    { v: "1000-5000", l: t.range3 },
    { v: "5000-10000",l: t.range4 },
    { v: "10000+",    l: t.range5 },
  ];
  return (
    <div className="animate-fadeInUp">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{t.step3Q}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{t.step3Sub}</p>
      {ranges.map((r) => (
        <ChoiceBtn
          key={r.v} label={r.l}
          selected={data.investmentRange === r.v}
          onClick={() => { update("investmentRange", r.v); onNext(); }}
        />
      ))}
    </div>
  );
}

// ── SCREEN 5: Risk ────────────────────────────────────────────────────────────
function RiskStep({ data, update, onNext, t }) {
  const risks = [
    { v: "low",    l: t.riskLow,  sub: t.riskLowSub,  icon: "🛡️" },
    { v: "medium", l: t.riskMed,  sub: t.riskMedSub,  icon: "⚖️" },
    { v: "high",   l: t.riskHigh, sub: t.riskHighSub, icon: "🚀" },
  ];
  return (
    <div className="animate-fadeInUp">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{t.step4Q}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{t.step4Sub}</p>
      {risks.map((r) => (
        <ChoiceBtn
          key={r.v} icon={r.icon}
          label={r.l.replace(/🛡️|⚖️|🚀/g, "").trim()}
          sub={r.sub}
          selected={data.risk === r.v}
          onClick={() => { update("risk", r.v); onNext(); }}
        />
      ))}
    </div>
  );
}

// ── SCREEN 6: Goal ────────────────────────────────────────────────────────────
function GoalStep({ data, update, onNext, t }) {
  const goals = [
    { v: "emergency", l: t.goalEmergency, icon: "🆘" },
    { v: "vacation",  l: t.goalVacation,  icon: "✈️" },
    { v: "education", l: t.goalEducation, icon: "🎓" },
    { v: "home",      l: t.goalHome,      icon: "🏠" },
    { v: "marriage",  l: t.goalMarriage,  icon: "💍" },
    { v: "retirement",l: t.goalRetirement,icon: "🌅" },
  ];
  return (
    <div className="animate-fadeInUp">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>{t.step5Q}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{t.step5Sub}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        {goals.map((g) => (
          <button key={g.v} onClick={() => { update("goal", g.v); onNext(); }} style={{
            padding: "16px 10px", borderRadius: 14,
            border: `1.5px solid ${data.goal === g.v ? C.saffron : C.border}`,
            background: data.goal === g.v ? C.saffronLight : C.card,
            color: data.goal === g.v ? C.saffron : C.text,
            fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 26 }}>{g.icon}</span>
            {g.l.replace(/🆘|✈️|🎓|🏠|💍|🌅/g, "").trim()}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ONBOARDING FLOW ──────────────────────────────────────────────────────
const STEPS = ["splash", "name", "language", "profession", "range", "risk", "goal"];

export default function OnboardingFlow({ onFinish }) {
  const { t, setLang } = useLang();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", language: "en", profession: "",
    investmentRange: "", risk: "", goal: "",
  });

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const next = () => setStep((s) => s + 1);

  const finish = async (finalData) => {
    try { await userAPI.save(finalData); } catch (e) { /* non-blocking */ }
    onFinish(finalData);
  };

  // Splash
  if (step === 0) return <SplashScreen onStart={next} />;

  const contentStep = step - 1; // steps 1-6 → index 0-5
  const totalContentSteps = STEPS.length - 1; // 6

  const stepScreens = [
    <NameStep       data={data} update={update} onNext={next} t={t} />,
    <LanguageStep   data={data} update={update} onNext={next} t={t} setLang={setLang} />,
    <ProfessionStep data={data} update={update} onNext={next} t={t} />,
    <RangeStep      data={data} update={update} onNext={next} t={t} />,
    <RiskStep       data={data} update={update} onNext={next} t={t} />,
    <GoalStep       data={data} update={update} onNext={() => finish(data)} t={t} />,
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FFF5EE 0%, #FFFFFF 50%, #EEF4FF 100%)",
      display: "flex", flexDirection: "column", padding: "0 0 32px",
    }}>
      {/* Top bar */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: C.card, border: `1px solid ${C.border}`,
            cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}>←</button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: totalContentSteps }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 4,
                background: i < contentStep ? C.saffron : i === contentStep ? C.saffronLight : C.border,
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>
            Step {contentStep + 1} of {totalContentSteps}
          </p>
        </div>
      </div>

      {/* Logo row */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>💎</div>
        <span style={{ fontWeight: 800, fontSize: 18, color: C.text }}>
          Nivesh<span style={{ color: C.saffron }}>Saathi</span>
        </span>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: "0 20px" }}>
        <div style={{
          background: C.card, borderRadius: 22, padding: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}>
          {stepScreens[contentStep] || null}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 20 }}>
        {t.dataPrivacy}
      </p>
    </div>
  );
}