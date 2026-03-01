const express = require("express");
const router = express.Router();
const avisProduitController = require("../controllers/avis-produit.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE
router.post("/", authMiddleware, avisProduitController.add);

// UPDATE
router.put("/:id", authMiddleware, avisProduitController.update);

// DELETE
router.delete("/:id", authMiddleware, avisProduitController.remove);

module.exports = router;
