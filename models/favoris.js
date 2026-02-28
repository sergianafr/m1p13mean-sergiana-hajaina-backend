const mongoose = require("mongoose");

const Favoris = new mongoose.Schema(
    {
        dateAjout: {
            type: Date,
            required: true
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

module.exports = mongoose.model("Favoris", Favoris);
