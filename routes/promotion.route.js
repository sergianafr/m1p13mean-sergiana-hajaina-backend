const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotion.controller");

// CREATE
router.post("/", promotionController.save);

// READ ALL
router.get("/", promotionController.getAll);

// GET ACTIVE PROMOTIONS
router.get("/active", promotionController.getActive);

// GET BY MAGASIN
router.get("/magasin/:magasinId", promotionController.getByMagasin);

// GET BY PRODUIT
router.get("/produit/:produitId", promotionController.getByProduit);

// READ ONE
router.get("/:id", promotionController.getById);

// UPDATE
router.put("/:id", promotionController.update);

// DELETE
router.delete("/:id", promotionController.remove);

module.exports = router;
