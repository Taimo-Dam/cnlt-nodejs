
const express = require("express");
const session = require("express-session");
const path = require("path");

const { logger, errorHandler } = require("./middleware");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const heavyRoutes = require("./routes/heavyRoutes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "student_api_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 30 * 60 * 1000 } // 30 minutes
}));

app.use(logger); 

app.use("/", authRoutes);
app.use("/students", studentRoutes);
app.use("/", heavyRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Student Management API",
    version: "1.0.0",
    endpoints: {
      auth: ["POST /login", "POST /logout"],
      students: [
        "GET /students",
        "GET /students/:id",
        "POST /students",
        "PUT /students/:id",
        "DELETE /students/:id",
        "GET /students/stats",
        "GET /students/stats/class"
      ],
      heavy: ["GET /heavy-sync", "GET /heavy-async"],
      query: {
        filter: "?name=...&class=...",
        sort: "?sort=age_asc|age_desc|name_asc|name_desc",
        pagination: "?page=1&limit=5"
      }
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Student API Server running on http://localhost:${PORT}`);
  console.log(`📚 Login: POST /login  { username: "admin", password: "123456" }`);
  console.log(`📋 Docs:  GET  /\n`);
});

module.exports = app;