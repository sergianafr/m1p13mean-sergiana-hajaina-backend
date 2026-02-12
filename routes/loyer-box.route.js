const express = require("express");
const router = express.Router();
const loyerBoxController = require("../controllers/loyer-box.controller");

// CREATE
router.post("/", loyerBoxController.save);

// READ ALL
router.get("/", loyerBoxController.getAll);

// READ ONE
router.get("/:id", loyerBoxController.getById);

// UPDATE
router.put("/:id", loyerBoxController.update);

// DELETE
router.delete("/:id", loyerBoxController.remove);

module.exports = router;
