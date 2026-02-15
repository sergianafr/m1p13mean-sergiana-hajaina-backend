const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produit.controller");

// CREATE
router.post("/", produitController.save);

// READ ALL
router.get("/", produitController.getAll);

// READ ONE
router.get("/:id", produitController.getById);

// UPDATE
router.put("/:id", produitController.update);

// DELETE
router.delete("/:id", produitController.remove);

module.exports = router;
