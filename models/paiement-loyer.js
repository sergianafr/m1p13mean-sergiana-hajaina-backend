const mongoose = require("mongoose");

const PaiementLoyerSchema = new mongoose.Schema(
    {
        magasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasin",
            required: true,
            index: true
        },
        box: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Box",
            required: true,
            index: true
        },
        loyerBox: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LoyerBox",
            required: true
        },
        mois: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        annee: {
            type: Number,
            required: true,
            min: 1900
        },
        datePaiement: {
            type: Date,
            required: true,
            default: Date.now
        },
        montantPaye: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { timestamps: true }
);

PaiementLoyerSchema.index({ magasin: 1, box: 1, mois: 1, annee: 1 }, { unique: true });
PaiementLoyerSchema.index({ box: 1, annee: 1, mois: 1 });

module.exports = mongoose.model("PaiementLoyer", PaiementLoyerSchema);
