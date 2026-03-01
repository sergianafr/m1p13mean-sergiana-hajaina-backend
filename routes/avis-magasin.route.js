const express = require("express");
const router = express.Router();
const avisMagasinController = require("../controllers/avis-magasin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE
router.post("/", authMiddleware, avisMagasinController.add);

module.exports = router;
