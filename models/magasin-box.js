const mongoose = require("mongoose");

const MagasinBoxSchema = new mongoose.Schema(
    {
        magasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Magasin",
            required: true
        },
        box: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Box",
            required: true
        },
        dateDebut: {
            type: Date,
            required: true
        },
        dateFin: {
            type: Date
        }
    },
    { timestamps: true }
);

MagasinBoxSchema.index({ magasin: 1, box: 1 }, { unique: true });

module.exports = mongoose.model("MagasinBox", MagasinBoxSchema);
