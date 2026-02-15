const mongoose = require("mongoose");

const UniteSchema = new mongoose.Schema(
    {
        nomUnite: {
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model("Unite", UniteSchema);