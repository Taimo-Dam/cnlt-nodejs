const express = require("express");
const router = express.Router();
const { requireLogin } = require("../../middleware");
const {
  getAll, getById, create, update, remove,
  getStats, getStatsByClass
} = require("../controllers/studentController");
 
router.get("/stats", requireLogin, getStats);
router.get("/stats/class", requireLogin, getStatsByClass);
 
// CRUD routes
router.get("/", requireLogin, getAll);
router.get("/:id", requireLogin, getById);
router.post("/", requireLogin, create);
router.put("/:id", requireLogin, update);
router.delete("/:id", requireLogin, remove);
 
module.exports = router;
 
