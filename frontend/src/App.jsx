import React, { useState } from "react";
import OnboardingFlow   from "./screens/OnboardingFlow.jsx";
import Dashboard        from "./screens/Dashboard.jsx";
import ChatScreen       from "./screens/ChatScreen.jsx";
import ExploreScreen    from "./screens/ExploreScreen.jsx";
import PortfolioScreen  from "./screens/PortfolioScreen.jsx";
import GoalsScreen      from "./screens/GoalsScreen.jsx";
import BottomNav        from "./components/BottomNav.jsx";

export default function App() {
  const [user,   setUser]   = useState(null);   // null = not onboarded
  const [screen, setScreen] = useState("home");

  // ── Onboarding ──────────────────────────────────────────────────────────────
  if (!user) {
    return <OnboardingFlow onFinish={(data) => { setUser(data); setScreen("home"); }} />;
  }

  // ── Main screens ────────────────────────────────────────────────────────────
  const screens = {
    home:      <Dashboard       user={user}  onNav={setScreen} />,
    chat:      <ChatScreen      user={user}  />,
    explore:   <ExploreScreen   user={user}  />,
    portfolio: <PortfolioScreen />,
    goals:     <GoalsScreen     />,
  };

  return (
    <div className="app-wrapper">
      <div className="screen-content">
        {screens[screen] || screens.home}
      </div>
      <BottomNav active={screen} onNav={setScreen} />
    </div>
  );
}