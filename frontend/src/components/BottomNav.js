import React from "react";
import { C } from "../utils/theme.js";
import { useLang } from "../context/LanguageContext.jsx";

export default function BottomNav({ active, onNav }) {
  const { t } = useLang();
  const tabs = [
    { id: "home",      icon: "🏠", label: t.navHome },
    { id: "chat",      icon: "🤖", label: t.navChat },
    { id: "explore",   icon: "📊", label: t.navExplore },
    { id: "portfolio", icon: "💼", label: t.navPortfolio },
    { id: "goals",     icon: "🎯", label: t.navGoals },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", padding: "8px 0 12px", zIndex: 200,
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onNav(tab.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0",
            position: "relative",
          }}>
            {isActive && (
              <div style={{
                position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                width: 32, height: 3, borderRadius: "0 0 6px 6px", background: C.saffron,
              }} />
            )}
            <span style={{ fontSize: 22, lineHeight: 1, filter: isActive ? "none" : "grayscale(60%) opacity(0.7)" }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 9, fontWeight: isActive ? 700 : 500,
              color: isActive ? C.saffron : C.muted,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}