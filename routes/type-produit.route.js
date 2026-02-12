
const express = require("express");
const router = express.Router();
const typeProduitController = require("../controllers/type-produit.controller");

// CREATE
router.post("/", typeProduitController.save);

// READ ALL
router.get("/", typeProduitController.getAll);

// READ ONE
router.get("/:id", typeProduitController.getById);

// UPDATE
router.put("/:id", typeProduitController.update);

// DELETE
router.delete("/:id", typeProduitController.remove);

module.exports = router;
