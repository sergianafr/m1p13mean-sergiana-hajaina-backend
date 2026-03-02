const mongoose = require("mongoose");

const MvtStock = new mongoose.Schema(
    {
        qteEntree: {
            type: Number,
            default: 0
        },
        qteSortie: {
            type: Number,
            default: 0
        },
        dateMvtStock: {
            type: Date
        },
        unite: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unite",
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

module.exports = mongoose.model("MvtStock", MvtStock);
