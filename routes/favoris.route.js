const express = require("express");
const router = express.Router();
const favorisController = require("../controllers/favoris.controller");

// READ BY USER
router.get("/user/:userId", favorisController.getByUser);

// CREATE
router.post("/", favorisController.add);

// DELETE
router.delete("/", favorisController.remove);

module.exports = router;
