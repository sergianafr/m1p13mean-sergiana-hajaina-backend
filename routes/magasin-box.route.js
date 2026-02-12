const express = require("express");
const router = express.Router();
const magasinBoxController = require("../controllers/magasin-box.controller");

// CREATE
router.post("/", magasinBoxController.save);

// READ ALL
router.get("/", magasinBoxController.getAll);

// READ ONE
router.get("/:id", magasinBoxController.getById);

// UPDATE
router.put("/:id", magasinBoxController.update);

// DELETE
router.delete("/:id", magasinBoxController.remove);

module.exports = router;
