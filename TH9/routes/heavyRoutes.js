const express = require("express");
const router = express.Router();

// Synchronous heavy computation (blocks the thread)
function fibonacciSync(n) {
  if (n <= 1) return n;
  return fibonacciSync(n - 1) + fibonacciSync(n - 2);
}

// Asynchronous heavy computation
function fibonacciAsync(n) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (n <= 1) resolve(n);
      else resolve(fibonacciSync(n - 1) + fibonacciSync(n - 2));
    }, 100); // Simulate async delay
  });
}

// GET /heavy-sync - Synchronous heavy computation
router.get("/heavy-sync", (req, res) => {
  const n = parseInt(req.query.n) || 35; // Default to 35 for noticeable delay
  const start = Date.now();
  const result = fibonacciSync(n);
  const end = Date.now();
  res.json({
    type: "sync",
    input: n,
    result,
    time: end - start
  });
});

// GET /heavy-async - Asynchronous heavy computation
router.get("/heavy-async", async (req, res) => {
  const n = parseInt(req.query.n) || 35;
  const start = Date.now();
  const result = await fibonacciAsync(n);
  const end = Date.now();
  res.json({
    type: "async",
    input: n,
    result,
    time: end - start
  });
});

module.exports = router;