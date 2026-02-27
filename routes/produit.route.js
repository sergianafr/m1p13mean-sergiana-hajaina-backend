const express = require("express");
const multer = require("multer");
const router = express.Router();
const produitController = require("../controllers/produit.controller");

const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post("/", upload.array("photos"), produitController.save);

// READ ALL
router.get("/", produitController.getAll);

// READ ONE
router.get("/:id", produitController.getById);

// UPDATE
router.put("/:id", upload.array("photos"), produitController.update);

// DELETE PHOTO
router.delete("/:id/photos", produitController.removePhoto);

// DELETE
router.delete("/:id", produitController.remove);

module.exports = router;
