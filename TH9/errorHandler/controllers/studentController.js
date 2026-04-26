const db = require("../../data/students");
const { validateStudent } = require("../../middleware");

const getAll = (req, res) => {
  const { name, class: cls, sort, page, limit } = req.query;

  let students = db.getActive();

  if (name) {
    students = students.filter(s =>
      s.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (cls) {
    students = students.filter(s =>
      s.class.toLowerCase() === cls.toLowerCase()
    );
  }

  if (sort) {
    if (sort === "age_asc") students.sort((a, b) => a.age - b.age);
    else if (sort === "age_desc") students.sort((a, b) => b.age - a.age);
    else if (sort === "name_asc") students.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "name_desc") students.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (page || limit) {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 10);
    const total = students.length;
    const start = (p - 1) * l;
    const data = students.slice(start, start + l);
    return res.json({ page: p, limit: l, total, data });
  }

  res.json(students);
};

const getStats = (req, res) => {
  const all = db.getAll();
  const active = all.filter(s => !s.isDeleted);
  const deleted = all.filter(s => s.isDeleted);
  const averageAge = active.length > 0
    ? parseFloat((active.reduce((sum, s) => sum + s.age, 0) / active.length).toFixed(2))
    : 0;

  res.json({
    total: all.length,
    active: active.length,
    deleted: deleted.length,
    averageAge
  });
};

const getStatsByClass = (req, res) => {
  const active = db.getActive();
  const classMap = {};
  active.forEach(s => {
    classMap[s.class] = (classMap[s.class] || 0) + 1;
  });
  const result = Object.entries(classMap).map(([cls, count]) => ({
    class: cls,
    count
  }));
  res.json(result);
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  const student = db.getById(id);
  if (!student || student.isDeleted) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
};

const create = (req, res) => {
  const { name, email, age, class: cls } = req.body;
  const errors = validateStudent({ name, email, age });
  if (errors.length > 0) return res.status(400).json({ errors });

  if (!cls || cls.trim().length === 0) {
    return res.status(400).json({ errors: ["class is required"] });
  }

  if (db.emailExists(email)) {
    return res.status(400).json({ errors: ["email already exists"] });
  }

  const student = db.create({
    name: name.trim(),
    email: email.trim(),
    age: Number(age),
    class: cls.trim()
  });

  res.status(201).json(student);
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.getById(id);
  if (!existing || existing.isDeleted) {
    return res.status(404).json({ error: "Student not found" });
  }

  const { name, email, age, class: cls } = req.body;
  const errors = validateStudent({ name, email, age }, true);
  if (errors.length > 0) return res.status(400).json({ errors });

  if (email && db.emailExists(email, id)) {
    return res.status(400).json({ errors: ["email already exists"] });
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.trim();
  if (age !== undefined) updateData.age = Number(age);
  if (cls !== undefined) updateData.class = cls.trim();

  const updated = db.update(id, updateData);
  res.json(updated);
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.getById(id);
  if (!existing || existing.isDeleted) {
    return res.status(404).json({ error: "Student not found" });
  }
  db.softDelete(id);
  res.json({ message: `Student ${id} deleted (soft delete)` });
};

module.exports = { getAll, getById, create, update, remove, getStats, getStatsByClass };