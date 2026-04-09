import React from "react";
import { C } from "../utils/theme.js";

export function Badge({ label, color = C.saffron, bg = C.saffronLight, style = {} }) {
  return (
    <span style={{
      background: bg, color, fontSize: 10, fontWeight: 700,
      padding: "3px 9px", borderRadius: 20, letterSpacing: 0.4,
      whiteSpace: "nowrap", display: "inline-block", ...style,
    }}>
      {label}
    </span>
  );
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 16, cursor: onClick ? "pointer" : "default", ...style,
    }}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, disabled, variant = "primary", style = {}, fullWidth }) {
  const vs = {
    primary: { background: C.saffron, color: "#fff", border: "none" },
    outline:  { background: C.saffronLight, color: C.saffron, border: `1.5px solid ${C.saffron}` },
    ghost:    { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger:   { background: C.redLight, color: C.red, border: `1.5px solid ${C.red}` },
    success:  { background: C.greenLight, color: C.green, border: `1.5px solid ${C.green}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...(vs[variant] || vs.primary),
      padding: "11px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s", width: fullWidth ? "100%" : undefined, ...style,
    }}>
      {children}
    </button>
  );
}

export function Spinner({ size = 24, color = C.saffron }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `3px solid ${color}22`, borderTopColor: color,
      animation: "spin 0.8s linear infinite", flexShrink: 0,
    }} />
  );
}

export function StatCard({ label, value, sub, color = C.text }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px 16px", flex: 1, minWidth: 0,
    }}>
      <p style={{ fontSize: 11, color: C.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

export function SectionHeader({ title, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
      <div style={{ fontSize: 44 }}>💎</div>
      <Spinner size={32} />
      <p style={{ color: C.muted, fontSize: 13 }}>Loading NiveshSaathi...</p>
    </div>
  );
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}