import express from "express";
import fs from "fs";

const router = express.Router();

router.post("/", (req, res) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json"));
  users.push(req.body);
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
  res.json({ message: "User saved" });
});

export default router;