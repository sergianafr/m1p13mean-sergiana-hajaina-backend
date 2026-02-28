const express = require("express");
const router = express.Router();
const favorisController = require("../controllers/favoris.controller");

// CREATE
router.post("/", favorisController.add);

// DELETE
router.delete("/", favorisController.remove);

module.exports = router;
