const mongoose = require("mongoose");

const PhotoProduitSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            unique: true
        },
        produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produits",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("PhotoProduit", PhotoProduitSchema);
