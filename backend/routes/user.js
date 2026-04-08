const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../data/users.json");

const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// POST /api/users — Save or update user profile
router.post("/", (req, res) => {
  const { name, language, profession, investmentRange, goal, risk } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const users = readUsers();
  const existingIdx = users.findIndex(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  );

  const userData = {
    id: existingIdx >= 0 ? users[existingIdx].id : "u" + Date.now(),
    name,
    language: language || "en",
    profession: profession || null,
    investmentRange: investmentRange || null,
    goal: goal || null,
    risk: risk || "medium",
    createdAt: existingIdx >= 0 ? users[existingIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    users[existingIdx] = userData;
  } else {
    users.push(userData);
  }

  writeUsers(users);
  return res.status(201).json({ message: "User profile saved", user: userData });
});

// GET /api/users — List all users (admin use)
router.get("/", (req, res) => {
  return res.json(readUsers());
});

module.exports = router;