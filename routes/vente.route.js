const express = require("express");
const router = express.Router();
const venteController = require("../controllers/vente.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ACHAT
router.post("/achat", authMiddleware, venteController.achat);

module.exports = router;
