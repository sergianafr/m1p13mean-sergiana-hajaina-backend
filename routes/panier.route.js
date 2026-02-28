const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panier.controller");

// CREATE
router.post("/", panierController.add);

// DELETE
router.delete("/", panierController.remove);

module.exports = router;
