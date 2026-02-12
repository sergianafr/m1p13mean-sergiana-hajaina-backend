const mongoose = require("mongoose");

const TypeProduitSchema = new mongoose.Schema(
    {
        nomTypeProduit: {
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model("TypeProduit", TypeProduitSchema);