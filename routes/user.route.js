const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// CREATE
router.post("/", userController.save);

// READ ALL
router.get("/", userController.getAll);

// READ BY ROLE
router.get("/role/:role", userController.getByRole);

// READ ONE
router.get("/:id", userController.getById);

// UPDATE
router.put("/:id", userController.update);

// DELETE
router.delete("/:id", userController.remove);

module.exports = router;
