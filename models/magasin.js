const mongoose = require("mongoose");

const MagasinSchema = new mongoose.Schema(
    {
        nomMagasin: {
            type: String,
            required: true,
            unique: true
        },
        dateAjout: {
            type: Date,
            default: Date.now
        },
        nif: String,
        stat: String,
        appUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        typeMagasin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TypeMagasin",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Magasin", MagasinSchema);
