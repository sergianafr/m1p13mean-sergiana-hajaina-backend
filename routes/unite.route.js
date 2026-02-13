
const express = require("express");
const router = express.Router();
const uniteController = require("../controllers/unite.controller");

// CREATE
router.post("/", uniteController.save);

// READ ALL
router.get("/", uniteController.getAll);

// READ ONE
router.get("/:id", uniteController.getById);

// UPDATE
router.put("/:id", uniteController.update);

// DELETE
router.delete("/:id", uniteController.remove);

module.exports = router;
