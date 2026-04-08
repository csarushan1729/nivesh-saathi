const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// ── Language-specific system prompts ─────────────────────────────────────────
const SYSTEM_PROMPTS = {
  en: `You are NiveshSaathi, a friendly Indian investment assistant helping regular Indians invest wisely.

Rules:
- Respond ONLY in clear, simple English. No jargon without explanation.
- Always use ₹ (Indian Rupee) for all currency amounts.
- Suggest specific products: SIP, Mutual Funds, FDs, or Liquid Funds.
- Keep responses SHORT and scannable (4-6 lines max). Use bullet points.
- Be warm, encouraging, and never make the user feel stupid.
- Goal mappings: Emergency fund → Liquid funds | Education → SIP in equity | Marriage → Balanced funds | House → FD + Hybrid | Retirement → Long-term SIP
- Mention "past returns don't guarantee future results" only once per conversation.
- If asked about stocks/crypto, gently redirect to mutual funds for beginners.
- Always end with a helpful follow-up question when you need more info.`,

  hi: `Aap NiveshSaathi hain, ek friendly Indian investment assistant jo regular Indians ko wisely invest karne mein help karte hain.

Rules:
- SIRF Hinglish mein respond karo (Hindi words, English script). Example: "Aapko SIP mein invest karna chahiye kyunki yeh long-term ke liye best hai."
- Hamesha ₹ use karo currency ke liye.
- Specific products suggest karo: SIP, Mutual Funds, FD, ya Liquid Funds.
- Responses SHORT rakhein (4-6 lines max). Bullet points use karo.
- Warm aur encouraging raho. User ko kabhi stupid feel mat karao.
- Goal mappings: Emergency fund → Liquid funds | Bacchon ki padhai → SIP equity | Shaadi → Balanced funds | Ghar → FD + Hybrid | Retirement → Long-term SIP
- "Past returns future guarantee nahi karte" ek baar zaroor bolna.
- Stocks/crypto ke baare mein puchha jaye toh mutual funds recommend karo beginners ke liye.`,

  te: `Meeru NiveshSaathi, oka friendly Indian investment assistant, regular Indians ki wisely invest cheyyataniki help chestaru.

Rules:
- KEVALAM Telugu-English mix (Tenglish) lo respond cheyyandi. Example: "Meeru SIP lo invest cheyyali, idi long-term ki best."
- Anni currency amounts ki ₹ (Indian Rupee) vadandi.
- Specific products suggest cheyyandi: SIP, Mutual Funds, FDs, ya Liquid Funds.
- Responses SHORT ga (4-6 lines max) mariyu bullet points vadandi.
- Warm mariyu encouraging ga undandi. User ni ela aynaa silly feel cheseyakandi.
- Goal mappings: Emergency fund → Liquid funds | Pillala chadduvulu → SIP equity | Pelli → Balanced funds | Intlu → FD + Hybrid | Retirement → Long-term SIP
- "Past returns future ki guarantee ivvavu" ani okasari mention cheyyandi.
- Stocks/crypto gurinchi adagite, beginners ki mutual funds recommend cheyyandi.`,
};

// POST /api/chat
router.post("/", async (req, res) => {
  const { messages, language = "en", userProfile = {} } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required and must not be empty" });
  }

  // Validate each message
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return res.status(400).json({ error: "Each message must have role and content fields" });
    }
    if (!["user", "assistant"].includes(msg.role)) {
      return res.status(400).json({ error: "Message role must be 'user' or 'assistant'" });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not configured. Add it to your .env file.",
    });
  }

  // Build system prompt with user profile context
  let systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;

  if (userProfile && userProfile.name) {
    const profileLines = [
      `\n\nUser Profile (use this to personalize your response):`,
      `- Name: ${userProfile.name}`,
      userProfile.profession ? `- Profession: ${userProfile.profession}` : null,
      userProfile.investmentRange ? `- Monthly investment budget: ${userProfile.investmentRange}` : null,
      userProfile.goal ? `- Primary goal: ${userProfile.goal}` : null,
      userProfile.risk ? `- Risk appetite: ${userProfile.risk}` : null,
      userProfile.language ? `- Language preference: ${userProfile.language}` : null,
    ].filter(Boolean).join("\n");
    systemPrompt += profileLines;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: String(m.content),
        })),
      }),
    });

    if (!response.ok) {
      let errData;
      try {
        errData = await response.json();
      } catch {
        errData = { error: { message: "Unknown API error" } };
      }
      console.error("Anthropic API error:", response.status, errData);
      return res.status(response.status).json({
        error: "AI service returned an error",
        detail: errData?.error?.message || "Please check your API key and try again",
      });
    }

    const data = await response.json();
    const reply = data.content?.map((b) => (b.type === "text" ? b.text : "")).join("") || "";

    if (!reply) {
      return res.status(500).json({ error: "AI returned an empty response. Please try again." });
    }

    return res.json({
      reply,
      language,
      usage: data.usage || null,
    });
  } catch (err) {
    console.error("Chat route error:", err.message);
    return res.status(500).json({
      error: "Failed to reach AI service",
      detail: err.message,
    });
  }
});

module.exports = router;