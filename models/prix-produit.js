const mongoose = require("mongoose");

const PrixProduitSchema = new mongoose.Schema(
    {
        prixUnitaire: {
            type: Number,
            required: true
        },
        dateDebut: {
            type: Date,
            required: true
        },
        dateFin: {
            type: Date
        },
        produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produit",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("PrixProduit", PrixProduitSchema);
