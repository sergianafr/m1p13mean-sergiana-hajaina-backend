const mongoose = require("mongoose");

const AvisProduit = new mongoose.Schema(
    {
        dateAjout: {
            type: Date,
            required: true
        },
        commentaire: {
            type: String
        },
        nombreEtoile: {
            type: Number,
            default: 0
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

module.exports = mongoose.model("AvisProduit", AvisProduit);
