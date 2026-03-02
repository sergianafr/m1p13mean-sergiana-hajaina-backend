
const express = require("express");
const router = express.Router();
const typeProduitController = require("../controllers/type-produit.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// CREATE
router.post("/", authMiddleware, roleMiddleware("ADMIN"), typeProduitController.save);

// READ ALL
router.get("/", typeProduitController.getAll);

// READ ONE
router.get("/:id", typeProduitController.getById);

// UPDATE
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), typeProduitController.update);

// DELETE
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), typeProduitController.remove);

module.exports = router;
