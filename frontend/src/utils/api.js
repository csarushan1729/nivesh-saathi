const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || "API error");
  return data;
};

export const api = {
  chat: (messages, language, userProfile) =>
    fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language, userProfile }),
    }).then(handle),

  recommend: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/recommend?${q}`).then(handle);
  },

  portfolio: (lang = "en") =>
    fetch(`${BASE}/api/portfolio?lang=${lang}`).then(handle),

  funds: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/funds?${q}`).then(handle);
  },

  saveUser: (profile) =>
    fetch(`${BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).then(handle),

  sipCalculate: (body) =>
    fetch(`${BASE}/api/recommend/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  health: () => fetch(`${BASE}/api/health`).then(handle),
};