const express = require("express");
const router = express.Router();
const magasinController = require("../controllers/magasin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// CREATE
router.post("/", authMiddleware, roleMiddleware("ADMIN"), magasinController.save);

// READ ALL WITH RATINGS
router.get("/with-ratings", magasinController.getAllWithRatings);

// READ ALL
router.get("/", magasinController.getAll);

// READ MINE (authenticated)
router.get("/mine", authMiddleware, magasinController.getMine);

// READ ONE WITH RATING
router.get("/:id/with-rating", magasinController.getByIdWithRating);

// GET PRODUCTS BY MAGASIN
router.get("/:id/produits", magasinController.getProducts);

// GET REVIEWS BY MAGASIN
router.get("/:id/avis", magasinController.getReviews);

// READ ONE
router.get("/:id", magasinController.getById);

// UPDATE
router.put("/:id", magasinController.update);

// DELETE
router.delete("/:id", magasinController.remove);

module.exports = router;
