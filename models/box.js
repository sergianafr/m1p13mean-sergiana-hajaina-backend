const mongoose = require("mongoose");

const BoxSchema = new mongoose.Schema(
    {
        nomBox: {
            type: String,
            required: true
        },
        aireBox: {
            type: Number,
            required: true
        }
    }
);

module.exports = mongoose.model("Box", BoxSchema);