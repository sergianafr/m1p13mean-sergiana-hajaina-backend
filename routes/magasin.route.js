const express = require("express");
const router = express.Router();
const magasinController = require("../controllers/magasin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// CREATE
router.post("/", authMiddleware, roleMiddleware("ADMIN"), magasinController.save);

// READ ALL
router.get("/", magasinController.getAll);

// READ MINE (authenticated)
router.get("/mine", authMiddleware, magasinController.getMine);

// READ ONE
router.get("/:id", magasinController.getById);

// UPDATE
router.put("/:id", magasinController.update);

// DELETE
router.delete("/:id", magasinController.remove);

module.exports = router;
