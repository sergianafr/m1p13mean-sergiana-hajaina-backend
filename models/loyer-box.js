const mongoose = require("mongoose");

const LoyerBoxSchema = new mongoose.Schema(
    {
        montantLoyer: {
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
        box: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Box",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("LoyerBox", LoyerBoxSchema);
