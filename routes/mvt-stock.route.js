const express = require("express");
const router = express.Router();
const mvtStockController = require("../controllers/mvt-stock.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE MVT STOCK (entree/sortie)
router.post("/", authMiddleware, mvtStockController.create);

// GET STOCK BY MAGASIN (all produits with stock)
router.get("/magasin/:magasinId", authMiddleware, mvtStockController.getByMagasin);

// GET STOCK FOR ONE PRODUIT
router.get("/produit/:produitId", authMiddleware, mvtStockController.getByProduit);

// GET MVT HISTORY FOR ONE PRODUIT
router.get("/produit/:produitId/mouvements", authMiddleware, mvtStockController.getMvtsByProduit);

module.exports = router;
