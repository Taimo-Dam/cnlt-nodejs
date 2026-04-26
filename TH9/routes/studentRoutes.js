const express = require("express");
const router = express.Router();
const students = require("../data/students");
const { requireLogin, validateStudent } = require("../middleware");

// GET /students - Get all active students
router.get("/", (req, res) => {
  const activeStudents = students.getActive();
  res.json(activeStudents);
});

// GET /students/:id - Get student by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.getById(id);
  if (!student || student.isDeleted) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

// POST /students - Create new student (requires login)
router.post("/", requireLogin, (req, res) => {
  const data = req.body;
  const errors = validateStudent(data);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  if (students.emailExists(data.email)) {
    return res.status(400).json({ error: "Email already exists" });
  }
  const student = students.create(data);
  res.status(201).json(student);
});

// PUT /students/:id - Update student (requires login)
router.put("/:id", requireLogin, (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  const errors = validateStudent(data, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  if (data.email && students.emailExists(data.email, id)) {
    return res.status(400).json({ error: "Email already exists" });
  }
  const student = students.update(id, data);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

// DELETE /students/:id - Soft delete student (requires login)
router.delete("/:id", requireLogin, (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.softDelete(id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json({ message: "Student deleted successfully" });
});

// GET /students/stats - Get student statistics
router.get("/stats", (req, res) => {
  const activeStudents = students.getActive();
  const total = activeStudents.length;
  const avgAge = total > 0 ? activeStudents.reduce((sum, s) => sum + s.age, 0) / total : 0;
  const classStats = activeStudents.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {});
  res.json({
    totalStudents: total,
    averageAge: Math.round(avgAge * 100) / 100,
    classDistribution: classStats
  });
});

// GET /students/stats/class - Get class-specific statistics
router.get("/stats/class", (req, res) => {
  const activeStudents = students.getActive();
  const classStats = activeStudents.reduce((acc, s) => {
    if (!acc[s.class]) {
      acc[s.class] = { count: 0, totalAge: 0, students: [] };
    }
    acc[s.class].count++;
    acc[s.class].totalAge += s.age;
    acc[s.class].students.push({ id: s.id, name: s.name, age: s.age });
    return acc;
  }, {});
  Object.keys(classStats).forEach(cls => {
    classStats[cls].averageAge = Math.round((classStats[cls].totalAge / classStats[cls].count) * 100) / 100;
  });
  res.json(classStats);
});

module.exports = router;