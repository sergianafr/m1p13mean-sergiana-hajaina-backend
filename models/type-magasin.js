const mongoose = require("mongoose");

const typeMagasinSchema = new mongoose.Schema(
    {
        nomTypeMagasin: {
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model("TypeMagasin", typeMagasinSchema);