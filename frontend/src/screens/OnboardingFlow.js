import React, { useState } from "react";

export default function OnboardingFlow({ onFinish }) {
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    name: "",
    language: "en",
    profession: "",
    amount: "",
    goal: ""
  });

  const update = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const next = () => setStep(step + 1);
  const skipIntro = () => onFinish(data);

  const progress = ((step + 1) / 8) * 100;

  return (
    <div className="app-wrapper" style={{ padding: 20 }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 42 }}>💎</div>
        <h2 style={{ color: "#FF6B00" }}>NiveshSaathi</h2>
      </div>

      {/* PROGRESS */}
      {step > 0 && (
        <div style={{ height: 6, background: "#eee", borderRadius: 10, marginBottom: 20 }}>
          <div style={{
            width: `${progress}%`,
            background: "#FF6B00",
            height: "100%",
            borderRadius: 10
          }} />
        </div>
      )}

      <div style={{
        background: "#fff",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
      }}>

        {/* 🌟 0. WELCOME */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <h1>Invest Smart 💰</h1>
            <p style={{ color: "#777" }}>
              Your AI-powered investment companion
            </p>
            <button onClick={next}>Get Started →</button>
          </div>
        )}

        {/* 👤 1. NAME */}
        {step === 1 && (
          <>
            <h3>What’s your name? 👋</h3>
            <input
              placeholder="Enter your name"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <button disabled={!data.name} onClick={next}>Next →</button>
          </>
        )}

        {/* 🌐 2. LANGUAGE */}
        {step === 2 && (
          <>
            <h3>Select your language 🌐</h3>
            <p style={{ color: "#777" }}>
              App UI will stay in English, but responses will be in your language
            </p>

            <button onClick={() => { update("language", "en"); next(); }}>
              English
            </button>

            <button onClick={() => { update("language", "hi"); next(); }}>
              Hindi
            </button>

            <button onClick={() => { update("language", "te"); next(); }}>
              Telugu
            </button>
          </>
        )}

        {/* 💼 3. PROFESSION */}
        {step === 3 && (
          <>
            <h3>Your profession 💼</h3>
            <input
              placeholder="Student / Engineer / Business"
              value={data.profession}
              onChange={(e) => update("profession", e.target.value)}
            />
            <button disabled={!data.profession} onClick={next}>Next →</button>
          </>
        )}

        {/* 💰 4. INVESTMENT RANGE */}
        {step === 4 && (
          <>
            <h3>Monthly investment range 💰</h3>

            <div onClick={() => { update("amount", "1000-5000"); next(); }}>
              ₹1K – ₹5K
            </div>

            <div onClick={() => { update("amount", "5000-20000"); next(); }}>
              ₹5K – ₹20K
            </div>

            <div onClick={() => { update("amount", "20000+"); next(); }}>
              ₹20K+
            </div>
          </>
        )}

        {/* 🎯 5. PURPOSE */}
        {step === 5 && (
          <>
            <h3>Your goal 🎯</h3>

            <div onClick={() => { update("goal", "home"); next(); }}>
              🏠 Buy a Home
            </div>

            <div onClick={() => { update("goal", "education"); next(); }}>
              🎓 Education
            </div>

            <div onClick={() => { update("goal", "retirement"); next(); }}>
              🌅 Retirement
            </div>
          </>
        )}

        {/* 📘 6. INTRO 1 */}
        {step === 6 && (
          <>
            <h3>📊 Smart Recommendations</h3>
            <p>We suggest funds based on your profile</p>
            <button onClick={next}>Next</button>
            <button onClick={skipIntro}>Skip</button>
          </>
        )}

        {/* 🤖 7. INTRO 2 */}
        {step === 7 && (
          <>
            <h3>🤖 AI Assistant</h3>
            <p>Ask anything about investments anytime</p>
            <button onClick={next}>Next</button>
            <button onClick={skipIntro}>Skip</button>
          </>
        )}

        {/* 🚀 8. FINAL */}
        {step === 8 && (
          <>
            <h3>All Set 🎉</h3>
            <button onClick={() => onFinish(data)}>
              Start Investing 🚀
            </button>
          </>
        )}

      </div>

      <p style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
        🔒 Your data is private
      </p>
    </div>
  );
}