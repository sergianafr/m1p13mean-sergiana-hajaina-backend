const express = require("express");
const router = express.Router();
const prixProduitController = require("../controllers/prix-produit.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE
router.post("/", authMiddleware, prixProduitController.create);

// GET BY PRODUIT (historique)
router.get("/produit/:produitId", authMiddleware, prixProduitController.getByProduit);

// GET CURRENT PRIX
router.get("/produit/:produitId/current", authMiddleware, prixProduitController.getCurrentPrix);

// DELETE
router.delete("/:id", authMiddleware, prixProduitController.remove);

module.exports = router;
