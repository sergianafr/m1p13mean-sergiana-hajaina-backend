const express = require("express");
const router = express.Router();
const typeMagasinController = require("../controllers/type-magasin.controller");

router.post("/", typeMagasinController.save);

router.get("/", typeMagasinController.getAll);

router.get("/:id", typeMagasinController.getById);

router.put("/:id", typeMagasinController.update);

router.delete("/:id", typeMagasinController.remove);

module.exports = router;
