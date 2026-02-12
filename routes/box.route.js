const express = require("express");
const router = express.Router();
const boxController = require("../controllers/box.controller");

// CREATE
router.post("/", boxController.save);

// READ ALL
router.get("/", boxController.getAll);

// READ ONE
router.get("/:id", boxController.getById);

// UPDATE
router.put("/:id", boxController.update);

// DELETE
router.delete("/:id", boxController.remove);

module.exports = router;
