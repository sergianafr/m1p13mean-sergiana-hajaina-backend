const mongoose = require("mongoose");

const ProduitSchema = new mongoose.Schema(
    {
        nomProduit: {
            type: String,
            required: true,
            unique: true
        },
        descriptionProduit: String,
        seuilNotification: Number,
        unite: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unites",
            required: true
        },
        typeProduit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TypeProduits",
            required: true
        },
        magasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasins",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Produit", ProduitSchema);
