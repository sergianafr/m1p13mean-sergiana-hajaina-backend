const express = require("express");
const router = express.Router();
const avisMagasinController = require("../controllers/avis-magasin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE
router.post("/", authMiddleware, avisMagasinController.add);

// UPDATE
router.put("/:id", authMiddleware, avisMagasinController.update);

// DELETE
router.delete("/:id", authMiddleware, avisMagasinController.remove);

module.exports = router;
