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
            ref: "Unite",
            required: true
        },
        typeProduit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TypeProduit",
            required: true
        },
        magasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasin",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Produit", ProduitSchema);
