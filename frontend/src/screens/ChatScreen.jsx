import React, { useState, useRef, useEffect } from "react";
import { C } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";
import { chatAPI } from "../utils/api.js";

export default function ChatScreen({ user }) {
  const { t, lang } = useLang();

  const [messages, setMessages] = useState([
    { role: "assistant", content: t.chatWelcome(user?.name || "there") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const quickQs = [t.quickQ1, t.quickQ2, t.quickQ3, t.quickQ4];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");

    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      // ✅ Pass messages, language, and full userProfile to backend
      const reply = await chatAPI.send(
        updated.map((m) => ({ role: m.role, content: m.content })),
        lang,
        user || {}
      );
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (err) {
      const errMsg = err.message || "Something went wrong. Please try again.";
      setError(errMsg);
      // Remove the user message if AI failed, so they can retry
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)", background: C.bg }}>

      {/* Header */}
      <div style={{
        padding: "14px 20px 12px", borderBottom: `1px solid ${C.border}`,
        background: C.card, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B00, #FF9A3C)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🤖</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>NiveshSaathi AI</p>
            <p style={{ margin: 0, fontSize: 11, color: C.green }}>{t.chatReady}</p>
          </div>
          <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 20, background: C.saffronLight }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.saffron }}>
              {lang === "hi" ? "🇮🇳 हिन्दी" : lang === "te" ? "🏳️ తెలుగు" : "🇬🇧 English"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12,
            animation: "fadeInUp 0.3s ease both",
          }}>
            {m.role === "assistant" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: C.saffronLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, marginRight: 8, flexShrink: 0, marginTop: 2,
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius: m.role === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: m.role === "user" ? C.saffron : C.card,
              color: m.role === "user" ? "#fff" : C.text,
              fontSize: 14, lineHeight: 1.65,
              border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", marginBottom: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: C.saffronLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, marginRight: 8,
            }}>🤖</div>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: "18px 18px 18px 4px", padding: "14px 18px",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%", background: C.saffron,
                  animation: `bounce 1.1s infinite`,
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: C.redLight, border: `1px solid ${C.red}20`,
            borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 13,
            color: C.red, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, fontWeight: 700 }}>✕</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies - only show at beginning */}
      {messages.length <= 2 && (
        <div style={{ padding: "6px 16px 8px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
          {quickQs.map((q) => (
            <button key={q} onClick={() => send(q)} style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: 20,
              border: `1.5px solid ${C.saffron}`, background: C.saffronLight,
              color: C.saffron, fontSize: 12, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap",
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{
        padding: "10px 16px 14px", borderTop: `1px solid ${C.border}`,
        background: C.card, display: "flex", gap: 10, alignItems: "center", flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={t.chatInput}
          style={{
            flex: 1, padding: "11px 16px", borderRadius: 24,
            border: `1.5px solid ${input ? C.saffron : C.border}`,
            fontSize: 14, outline: "none", background: C.bg,
            transition: "border-color 0.2s",
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
          background: loading || !input.trim() ? C.border : C.saffron,
          color: "#fff", fontSize: 18, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>↑</button>
      </div>
    </div>
  );
}