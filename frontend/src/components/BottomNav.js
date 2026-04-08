// src/components/BottomNav.js
import React from "react";
import { C } from "../utils/theme";
import { useLang } from "../context/LanguageContext";

export default function BottomNav({ active, onNav }) {
  const { t } = useLang();
  const tabs = [
    { id: "home", icon: "🏠", label: t.navHome },
    { id: "chat", icon: "🤖", label: t.navChat },
    { id: "explore", icon: "📊", label: t.navExplore },
    { id: "portfolio", icon: "💼", label: t.navPortfolio },
    { id: "goals", icon: "🎯", label: t.navGoals },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", padding: "8px 0 env(safe-area-inset-bottom, 10px)",
      zIndex: 200,
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onNav(tab.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, background: "none", border: "none", cursor: "pointer",
            padding: "6px 0", position: "relative",
          }}>
            <span style={{ fontSize: 22, lineHeight: 1, filter: isActive ? "none" : "grayscale(60%)" }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 9, fontWeight: isActive ? 700 : 500,
              color: isActive ? C.saffron : C.muted,
              transition: "color 0.2s",
            }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 3, borderRadius: "0 0 4px 4px",
                background: C.saffron,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}