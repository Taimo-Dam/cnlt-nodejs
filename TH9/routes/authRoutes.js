const express = require("express");
const router = express.Router();

// POST /login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded auth for demo
  if (username === "admin" && password === "123456") {
    req.session.user = username;
    res.json({ message: "Login successful", user: username });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// POST /logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ message: "Logout successful" });
  });
});

module.exports = router;