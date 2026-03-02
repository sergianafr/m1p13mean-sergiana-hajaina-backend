
const express = require("express");
const router = express.Router();
const uniteController = require("../controllers/unite.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// CREATE
router.post("/", authMiddleware, roleMiddleware("ADMIN"), uniteController.save);

// READ ALL
router.get("/", uniteController.getAll);

// READ ONE
router.get("/:id", uniteController.getById);

// UPDATE
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), uniteController.update);

// DELETE
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), uniteController.remove);

module.exports = router;
