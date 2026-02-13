const express = require("express");
const router = express.Router();
const magasinController = require("../controllers/magasin.controller");

// CREATE
router.post("/", magasinController.save);

// READ ALL
router.get("/", magasinController.getAll);

// READ ONE
router.get("/:id", magasinController.getById);

// UPDATE
router.put("/:id", magasinController.update);

// DELETE
router.delete("/:id", magasinController.remove);

module.exports = router;
