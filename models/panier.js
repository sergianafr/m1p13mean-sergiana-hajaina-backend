const mongoose = require("mongoose");

const Panier = new mongoose.Schema(
    {
        qte: {
            type: Number,
            default: 1
        },
        produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produit",
        },
        appUser: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Panier", Panier);
