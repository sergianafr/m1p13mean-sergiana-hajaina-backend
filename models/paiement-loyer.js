const mongoose = require("mongoose");

const PaiementLoyerDetailSchema = new mongoose.Schema(
    {
        box: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Box",
            required: true
        },
        loyerBox: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LoyerBox",
            required: true
        },
        montantLoyer: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const PaiementLoyerSchema = new mongoose.Schema(
    {
        magasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasin",
            required: true,
            index: true
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
        },
        details: {
            type: [PaiementLoyerDetailSchema],
            default: []
        }
    },
    { timestamps: true }
);

PaiementLoyerSchema.index({ magasin: 1, mois: 1, annee: 1 }, { unique: true });
PaiementLoyerSchema.index({ "details.box": 1, annee: 1, mois: 1 });

module.exports = mongoose.model("PaiementLoyer", PaiementLoyerSchema);
