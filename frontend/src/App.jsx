
import { useState, useRef, useEffect } from "react";
import { userAPI, portfolioAPI, chatAPI } from "./utils/api";

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────
const DUMMY_PORTFOLIO = [
  { id: 1, name: "SBI Bluechip Fund", type: "Mutual Fund", category: "equity", invested: 15000, current: 17340, returns: 15.6, monthlyReturn: 0.8, risk: "medium" },
  { id: 2, name: "HDFC Liquid Fund", type: "Liquid Fund", category: "liquid", invested: 10000, current: 10412, returns: 4.12, monthlyReturn: 0.34, risk: "low" },
  { id: 3, name: "Post Office FD", type: "Fixed Deposit", category: "fd", invested: 25000, current: 26750, returns: 7.0, monthlyReturn: 0.57, risk: "low" },
  { id: 4, name: "Axis ELSS Fund (SIP)", type: "SIP", category: "equity", invested: 6000, current: 6780, returns: 13.0, monthlyReturn: 1.08, risk: "high" },
];

const FUND_SUGGESTIONS = {
  low: [
    { name: "SBI Liquid Fund", type: "Liquid Fund", returns: "4–5%", minAmount: 500, lock: "None", risk: "Low", icon: "💧", desc: "Best for emergency fund / parking money. Withdraw anytime." },
    { name: "Post Office FD", type: "Fixed Deposit", returns: "6.9–7.5%", minAmount: 1000, lock: "1–5 years", risk: "Low", icon: "🏦", desc: "Government-backed. Zero risk. Fixed returns." },
    { name: "Parag Parikh Conservative Fund", type: "Debt Fund", returns: "6–7%", minAmount: 1000, lock: "None", risk: "Low", icon: "📊", desc: "Slightly better than FD. Steady and safe." },
  ],
  medium: [
    { name: "SBI Bluechip Fund", type: "Large Cap MF", returns: "12–15%", minAmount: 500, lock: "Suggested 3yr", risk: "Medium", icon: "📈", desc: "Top Indian companies. Good for 2–5 year goals." },
    { name: "HDFC Balanced Advantage Fund", type: "Hybrid Fund", returns: "10–13%", minAmount: 500, lock: "Suggested 2yr", risk: "Medium", icon: "⚖️", desc: "Mix of equity and debt. Balanced risk." },
    { name: "Mirae Asset Emerging Bluechip", type: "Large & Mid Cap", returns: "13–17%", minAmount: 1000, lock: "Suggested 3yr", risk: "Medium", icon: "🚀", desc: "Rising Indian companies. Better returns, moderate risk." },
  ],
  high: [
    { name: "Axis ELSS Fund", type: "Tax-saving SIP", returns: "15–18%", minAmount: 500, lock: "3 years", risk: "High", icon: "💰", desc: "Save tax under 80C. High growth, 3 yr lock-in." },
    { name: "Nippon Small Cap Fund", type: "Small Cap", returns: "18–25%", minAmount: 1000, lock: "Suggested 5yr", risk: "High", icon: "🔥", desc: "High risk, high reward. For patient investors." },
    { name: "PGIM India Flexi Cap Fund", type: "Flexi Cap", returns: "16–20%", minAmount: 500, lock: "Suggested 3yr", risk: "High", icon: "⚡", desc: "Fund manager picks best stocks freely. Aggressive growth." },
  ],
};

const SYSTEM_PROMPT = `You are NiveshSaathi, a friendly Indian investment assistant. You help regular Indians (not experts) invest their money wisely.

Rules:
- Always respond in simple English (avoid jargon). If user writes in Hinglish, respond in Hinglish.
- Always use ₹ for currency.
- For any investment amount, suggest specific products: SIP, Mutual Funds, FDs, or Liquid Funds.
- Ask about: amount, goal (what for?), time horizon (when needed?), risk comfort (low/medium/high).
- If user gives all info, give concrete recommendations.
- Keep responses SHORT (max 4-5 lines per reply). Use bullet points.
- Start with a warm greeting if it's the first message.
- Never give complex financial jargon.
- Always mention "past returns don't guarantee future results" once per conversation.
- If asked about stocks/crypto, gently redirect to mutual funds for beginners.
- Common goals: Emergency fund → Liquid funds. Child education → SIP in equity. Marriage → Balanced funds. House → FD + Hybrid. Retirement → Long-term SIP.

Format responses clearly with line breaks.`;

// ─── COLOURS / THEME ──────────────────────────────────────────────────────────
const C = {
  saffron: "#FF6B00",
  saffronLight: "#FFF0E5",
  green: "#00875A",
  greenLight: "#E3F5EE",
  blue: "#0057FF",
  blueLight: "#E5EEFF",
  bg: "#F7F7F5",
  card: "#FFFFFF",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  border: "#E8E8E4",
  red: "#D72B2B",
  redLight: "#FDECEA",
  amber: "#E07A00",
  amberLight: "#FFF4E0",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const pct = (n) => (n >= 0 ? "+" : "") + Number(n).toFixed(2) + "%";

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function Badge({ label, color = C.saffron, bg = C.saffronLight }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.3 }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, color = C.text }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 11, color: C.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", income: "", risk: "", goal: "" });

  const steps = [
    {
      q: "Aapka naam kya hai? 👋",
      sub: "Let's get to know you",
      field: "name",
      type: "text",
      placeholder: "e.g. Rahul",
    },
    {
      q: "Aap kitna invest karna chahte hain? 💰",
      sub: "Monthly or one-time amount",
      field: "income",
      type: "text",
      placeholder: "e.g. ₹5000",
    },
    {
      q: "Risk kitna le sakte ho? ⚖️",
      sub: "This helps us pick the right funds",
      field: "risk",
      type: "choice",
      options: [
        { val: "low", label: "🛡️ Low risk", sub: "Safe, steady returns" },
        { val: "medium", label: "⚖️ Medium risk", sub: "Balanced growth" },
        { val: "high", label: "🚀 High risk", sub: "Maximum growth" },
      ],
    },
    {
      q: "Main goal kya hai? 🎯",
      sub: "What are you investing for?",
      field: "goal",
      type: "choice",
      options: [
        { val: "emergency", label: "🆘 Emergency Fund" },
        { val: "vacation", label: "✈️ Vacation" },
        { val: "education", label: "🎓 Education" },
        { val: "home", label: "🏠 Buy a Home" },
        { val: "marriage", label: "💍 Marriage" },
        { val: "retirement", label: "🌅 Retirement" },
      ],
    },
  ];

  const cur = steps[step];
  const canNext = data[cur.field] !== "";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFF5EE 0%, #FFF 60%, #E8F5FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>💎</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.saffron, margin: "8px 0 2px", fontFamily: "Georgia, serif" }}>NiveshSaathi</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Your AI Investment Friend</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? C.saffron : C.border, transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: C.card, borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>{cur.q}</h2>
          <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>{cur.sub}</p>

          {cur.type === "text" && (
            <input
              value={data[cur.field]}
              onChange={(e) => setData({ ...data, [cur.field]: e.target.value })}
              placeholder={cur.placeholder}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              onKeyDown={(e) => e.key === "Enter" && canNext && (step < steps.length - 1 ? setStep(step + 1) : onComplete(data))}
            />
          )}

          {cur.type === "choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cur.options.map((o) => (
                <button
                  key={o.val}
                  onClick={() => {
                    const newData = { ...data, [cur.field]: o.val };
                    setData(newData);
                    setTimeout(() => {
                      if (step < steps.length - 1) setStep(step + 1);
                      else onComplete(newData);
                    }, 200);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${data[cur.field] === o.val ? C.saffron : C.border}`,
                    background: data[cur.field] === o.val ? C.saffronLight : C.card,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.text,
                    transition: "all 0.15s",
                  }}
                >
                  {o.label}
                  {o.sub && <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.muted, marginTop: 2 }}>{o.sub}</span>}
                </button>
              ))}
            </div>
          )}

          {cur.type === "text" && (
            <button
              onClick={() => (step < steps.length - 1 ? setStep(step + 1) : onComplete(data))}
              disabled={!canNext}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: canNext ? C.saffron : C.border,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: canNext ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              {step < steps.length - 1 ? "Next →" : "Start Investing 🚀"}
            </button>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 16 }}>🔒 Your data stays on your device. We don't share it.</p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onNav }) {
  const total = DUMMY_PORTFOLIO.reduce((a, b) => a + b.current, 0);
  const invested = DUMMY_PORTFOLIO.reduce((a, b) => a + b.invested, 0);
  const gain = total - invested;
  const gainPct = ((gain / invested) * 100).toFixed(1);

  const tips = [
    "💡 SIP started early grows 3x more than a lump sum started late.",
    "💡 Liquid funds are better than savings accounts for emergency funds.",
    "💡 ELSS funds save tax AND grow money — double benefit!",
    "💡 Don't withdraw SIP during market dips — that's when it works best.",
    "💡 ₹500/month SIP for 20 years can become ₹5 lakh+ at 12% returns.",
  ];
  const [tipIdx] = useState(Math.floor(Math.random() * tips.length));

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Namaste 👋</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>{user.name}</h2>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.saffron, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>
          {user.name[0]?.toUpperCase()}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div style={{ background: `linear-gradient(135deg, ${C.saffron} 0%, #FF9A3C 100%)`, borderRadius: 20, padding: "22px 24px", marginBottom: 16, color: "#fff" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.85 }}>Total Portfolio Value</p>
        <h1 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 800 }}>{fmt(total)}</h1>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Invested</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{fmt(invested)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Total Gain</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>+{fmt(gain)} ({gainPct}%)</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { icon: "🤖", label: "Ask AI", sub: "Get advice", nav: "chat", bg: C.blueLight, color: C.blue },
          { icon: "📊", label: "Explore Funds", sub: "Find investments", nav: "recommend", bg: C.greenLight, color: C.green },
          { icon: "💼", label: "My Portfolio", sub: "Track returns", nav: "portfolio", bg: C.saffronLight, color: C.saffron },
          { icon: "🎯", label: "My Goals", sub: "Plan ahead", nav: "goals", bg: "#F3E8FF", color: "#7C3AED" },
        ].map((a) => (
          <button
            key={a.nav}
            onClick={() => onNav(a.nav)}
            style={{
              background: a.bg,
              border: "none",
              borderRadius: 16,
              padding: "16px 14px",
              textAlign: "left",
              cursor: "pointer",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: a.color }}>{a.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{a.sub}</p>
          </button>
        ))}
      </div>

      {/* Holdings */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Top Holdings</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DUMMY_PORTFOLIO.slice(0, 3).map((f) => {
          const g = f.current - f.invested;
          const gp = ((g / f.invested) * 100).toFixed(1);
          return (
            <div key={f.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text }}>{f.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>{f.type}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>{fmt(f.current)}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.green, fontWeight: 600 }}>+{gp}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Tip */}
      <div style={{ background: C.amberLight, border: `1px solid #F5C842`, borderRadius: 14, padding: "14px 16px", marginTop: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#7A4F00", lineHeight: 1.5 }}>{tips[tipIdx]}</p>
      </div>
    </div>
  );
}

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
function ChatScreen({ user }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Namaste ${user.name}! 👋 Main NiveshSaathi hoon — aapka AI investment friend.\n\nAap mujhse pooch sakte ho:\n• "₹5000 kahan invest karoon?"\n• "SIP kya hoti hai?"\n• "Mujhe 3 saal mein ₹1 lakh chahiye"\n\nBataiye, main kaise help kar sakta hoon? 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const QUICK = ["₹5000 kahan invest karoon?", "SIP kya hoti hai?", "Low risk funds suggest karo", "Emergency fund kaise banayein?"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const reply = await chatAPI.send(
        updated.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        "en",
        user
      );

      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "Internet ya API issue hai. Dobara try karein! 🙏",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}`, background: C.card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.saffron, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>NiveshSaathi AI</p>
            <p style={{ margin: 0, fontSize: 11, color: C.green }}>● Online — Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0 }}>🤖</div>
            )}
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? C.saffron : C.card,
                color: m.role === "user" ? "#fff" : C.text,
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8 }}>🤖</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: C.saffron,
                      animation: "bounce 1s infinite",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div style={{ padding: "8px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{
                flexShrink: 0,
                padding: "7px 13px",
                borderRadius: 20,
                border: `1.5px solid ${C.saffron}`,
                background: C.saffronLight,
                color: C.saffron,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${C.border}`, background: C.card, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && send()}
          placeholder="Apna sawaal likho..."
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 24,
            border: `1.5px solid ${C.border}`,
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: loading || !input.trim() ? C.border : C.saffron,
            border: "none",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: 18,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↑
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
    </div>
  );
}

// ─── RECOMMENDATIONS ──────────────────────────────────────────────────────────
function RecommendScreen({ user }) {
  const [risk, setRisk] = useState(user.risk || "medium");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("short");
  const [shown, setShown] = useState(false);

  const funds = FUND_SUGGESTIONS[risk] || FUND_SUGGESTIONS.medium;

  const goalMap = {
    emergency: "low", vacation: "medium", education: "high",
    home: "medium", marriage: "medium", retirement: "high",
  };

  useEffect(() => {
    if (user.goal && goalMap[user.goal]) setRisk(goalMap[user.goal]);
  }, []);

  const riskColor = { low: C.green, medium: C.amber, high: C.red };
  const riskBg = { low: C.greenLight, medium: C.amberLight, high: C.redLight };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Explore Investments</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Find the right fund for your goal</p>

      {/* Filters */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 13 }}>Customize your search</p>

        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.muted }}>Your risk appetite</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["low", "medium", "high"].map((r) => (
              <button
                key={r}
                onClick={() => { setRisk(r); setShown(false); }}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `1.5px solid ${risk === r ? riskColor[r] : C.border}`,
                  background: risk === r ? riskBg[r] : C.bg,
                  color: risk === r ? riskColor[r] : C.muted,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {r === "low" ? "🛡️" : r === "medium" ? "⚖️" : "🚀"} {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.muted }}>Amount to invest</p>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. ₹10,000"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.muted }}>Investment period</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ val: "short", label: "< 1 year" }, { val: "medium", label: "1–3 years" }, { val: "long", label: "3+ years" }].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `1.5px solid ${period === p.val ? C.blue : C.border}`,
                  background: period === p.val ? C.blueLight : C.bg,
                  color: period === p.val ? C.blue : C.muted,
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShown(true)}
          style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: C.saffron, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          Show Recommendations →
        </button>
      </div>

      {/* Fund Cards */}
      {shown && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
            {funds.length} funds for you{" "}
            <Badge label={risk.toUpperCase() + " RISK"} color={riskColor[risk]} bg={riskBg[risk]} />
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {funds.map((f, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, position: "relative", overflow: "hidden" }}>
                {i === 0 && (
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <Badge label="⭐ TOP PICK" color="#7C3AED" bg="#F3E8FF" />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>{f.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text, paddingRight: 70 }}>{f.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{f.type}</p>
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Expected Returns", val: f.returns },
                    { label: "Min Amount", val: "₹" + f.minAmount },
                    { label: "Lock-in", val: f.lock },
                  ].map((s) => (
                    <div key={s.label} style={{ background: C.bg, borderRadius: 10, padding: "8px 10px" }}>
                      <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{s.label}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: C.text }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <button style={{ marginTop: 14, width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${C.saffron}`, background: C.saffronLight, color: C.saffron, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Invest in {f.name.split(" ")[0]} →
                </button>
              </div>
            ))}
          </div>
          <div style={{ background: C.amberLight, border: `1px solid #F5C842`, borderRadius: 12, padding: "12px 14px", marginTop: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#7A4F00" }}>⚠️ Mutual fund investments are subject to market risks. Past returns don't guarantee future results. Please read all documents carefully.</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
function PortfolioScreen() {
  const [selected, setSelected] = useState(null);
  const total = DUMMY_PORTFOLIO.reduce((a, b) => a + b.current, 0);
  const invested = DUMMY_PORTFOLIO.reduce((a, b) => a + b.invested, 0);
  const gain = total - invested;
  const gainPct = ((gain / invested) * 100).toFixed(2);

  const catColors = { equity: { bg: C.blueLight, color: C.blue }, liquid: { bg: C.greenLight, color: C.green }, fd: { bg: C.amberLight, color: C.amber }, sip: { bg: "#F3E8FF", color: "#7C3AED" } };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>My Portfolio</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>Track your investments</p>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="Current Value" value={fmt(total)} />
        <StatCard label="Total Invested" value={fmt(invested)} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Gain" value={"+" + fmt(gain)} color={C.green} />
        <StatCard label="Returns" value={"+" + gainPct + "%"} color={C.green} />
      </div>

      {/* Allocation bar */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 13 }}>Asset Allocation</p>
        <div style={{ display: "flex", height: 10, borderRadius: 10, overflow: "hidden", gap: 2, marginBottom: 12 }}>
          {DUMMY_PORTFOLIO.map((f) => {
            const cc = catColors[f.category] || catColors.equity;
            return (
              <div key={f.id} style={{ flex: f.current, background: cc.color, opacity: 0.85 }} />
            );
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DUMMY_PORTFOLIO.map((f) => {
            const cc = catColors[f.category] || catColors.equity;
            const pct2 = ((f.current / total) * 100).toFixed(0);
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: cc.color }} />
                <span style={{ fontSize: 11, color: C.muted }}>{f.name.split(" ")[0]} ({pct2}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings list */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>All Holdings</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {DUMMY_PORTFOLIO.map((f) => {
          const g = f.current - f.invested;
          const gp = ((g / f.invested) * 100).toFixed(2);
          const cc = catColors[f.category] || catColors.equity;
          const isOpen = selected === f.id;

          return (
            <div
              key={f.id}
              style={{ background: C.card, border: `1px solid ${isOpen ? C.saffron : C.border}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
            >
              <button
                onClick={() => setSelected(isOpen ? null : f.id)}
                style={{ width: "100%", padding: "16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {f.category === "equity" ? "📈" : f.category === "liquid" ? "💧" : f.category === "fd" ? "🏦" : "🔄"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{f.type}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>{fmt(f.current)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: C.green }}>+{gp}%</p>
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px", background: C.bg }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[
                      { l: "Amount Invested", v: fmt(f.invested) },
                      { l: "Current Value", v: fmt(f.current) },
                      { l: "Total Gain", v: "+" + fmt(g) },
                      { l: "Annual Returns", v: f.returns + "%" },
                    ].map((s) => (
                      <div key={s.l} style={{ background: C.card, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{s.l}</p>
                        <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: C.text }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: C.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      + Invest More
                    </button>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${C.red}`, background: C.redLight, color: C.red, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      Withdraw
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

// ─── GOALS SCREEN ─────────────────────────────────────────────────────────────
function GoalsScreen() {
  const [goals] = useState([
    { icon: "🏠", name: "Buy a Home", target: 500000, saved: 56750, deadline: "Dec 2027", color: C.blue },
    { icon: "✈️", name: "Europe Trip", target: 150000, saved: 27162, deadline: "Jun 2026", color: "#7C3AED" },
    { icon: "🎓", name: "MBA Course", target: 200000, saved: 10000, deadline: "Jul 2027", color: C.green },
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>My Goals</h2>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Plan your financial future</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goals.map((g, i) => {
          const pct2 = Math.min(100, ((g.saved / g.target) * 100));
          const remaining = g.target - g.saved;
          return (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 28 }}>{g.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>{g.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Target: {g.deadline}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(g.saved)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>of {fmt(g.target)}</p>
                </div>
              </div>

              <div style={{ background: C.bg, borderRadius: 8, height: 8, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct2 + "%", background: g.color, borderRadius: 8, transition: "width 1s ease" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: g.color, fontWeight: 600 }}>{pct2.toFixed(0)}% achieved</span>
                <span style={{ fontSize: 12, color: C.muted }}>{fmt(remaining)} remaining</span>
              </div>

              <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                  💡 Invest <strong>{fmt(Math.ceil(remaining / 24))}/month</strong> in SIP to reach this goal on time.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        style={{ marginTop: 16, width: "100%", padding: "13px", borderRadius: 14, border: `2px dashed ${C.saffron}`, background: C.saffronLight, color: C.saffron, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
      >
        + Add New Goal
      </button>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ active, onNav }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "chat", icon: "🤖", label: "AI Chat" },
    { id: "recommend", icon: "📊", label: "Explore" },
    { id: "portfolio", icon: "💼", label: "Portfolio" },
    { id: "goals", icon: "🎯", label: "Goals" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: C.card,
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      padding: "8px 0 12px",
      zIndex: 100,
      maxWidth: 480,
      margin: "0 auto",
    }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onNav(t.id)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: active === t.id ? 700 : 400, color: active === t.id ? C.saffron : C.muted }}>
            {t.label}
          </span>
          {active === t.id && (
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.saffron }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("nivesh_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = async (data) => {
    try {
      const res = await userAPI.save({
        name: data.name,
        investmentRange: data.income,
        risk: data.risk,
        goal: data.goal,
      });

      const saved = res.user;

      localStorage.setItem("nivesh_user", JSON.stringify(saved));
      setUser(saved);
    } catch (err) {
      alert("Unable to save user profile");
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const screens = {
    home: <Dashboard user={user} onNav={setScreen} />,
    chat: <ChatScreen user={user} />,
    recommend: <RecommendScreen user={user} />,
    portfolio: <PortfolioScreen />,
    goals: <GoalsScreen />,
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        paddingBottom: 80,
      }}
    >
      {screens[screen] || screens.home}
      <BottomNav active={screen} onNav={setScreen} />
    </div>
  );
}
