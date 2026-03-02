const express = require("express");
const router = express.Router();
const paiementLoyerController = require("../controllers/paiement-loyer.controller");

router.post("/", paiementLoyerController.save);
router.get("/", paiementLoyerController.getAll);
router.get("/magasin/:magasinId", paiementLoyerController.getByMagasin);
router.get("/:id", paiementLoyerController.getById);
router.delete("/:id", paiementLoyerController.remove);

module.exports = router;
