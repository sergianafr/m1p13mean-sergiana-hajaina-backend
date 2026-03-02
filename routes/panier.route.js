const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panier.controller");

// READ BY USER
router.get("/user/:userId", panierController.getByUser);

// CREATE
router.post("/", panierController.add);

// UPDATE QTE
router.put("/", panierController.update);

// DELETE
router.delete("/", panierController.remove);

// CLEAR BY USER
router.delete("/user/:userId", panierController.clearByUser);

module.exports = router;
