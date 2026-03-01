const mongoose = require("mongoose");

const Promotion = new mongoose.Schema(
    {
        qte: {
            type: Number,
            default: -1
        },
        pourcentage: {
            type: Number,
            default: 0
        },
         dateDebut: {
            type: Date,
            required: true
        },
        dateFin: {
            type: Date,
            required: true
        },
        produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produit",
        },
        magasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasin",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Promotion", Promotion);
