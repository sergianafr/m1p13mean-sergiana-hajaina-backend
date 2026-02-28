const mongoose = require("mongoose");

const VenteDetail = new mongoose.Schema(
    {
        qte: {
            type: Number,
            default: 0
        },
        prixUnitaire: {
            type: Number,
            default: 0
        },
        pourcentagePromotion:
        {
            type: Number,
            default: 0
        },
        prixTotal: {
            type: Date
        },
        vente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vente",
            required: true
        },
        produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produit",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("VenteDetail", VenteDetail);
