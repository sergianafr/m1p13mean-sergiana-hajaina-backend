const mongoose = require("mongoose");

const Vente = new mongoose.Schema(
    {
        magasin: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasin",
            required: true
        },
        appUser: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        dateVente: 
        {
            type: Date,
            default: new Date()
        },
        pourcentagePromotion:
        {
            type: Number,
            default: 0
        },
        totalPrix: {type: Number}
    },
    { timestamps: true }
);

module.exports = mongoose.model("Vente", Vente);
