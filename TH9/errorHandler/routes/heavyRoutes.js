const express = require("express");
const router = express.Router();
const { requireLogin } = require("../../middleware");
const { heavySync, heavyAsync } = require("../controllers/heavyController");
 
router.get("/heavy-sync", requireLogin, heavySync);
router.get("/heavy-async", requireLogin, heavyAsync);
 
module.exports = router;
 
