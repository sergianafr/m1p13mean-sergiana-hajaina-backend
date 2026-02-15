const Box = require("../models/box");

// CREATE
exports.save = async (req, res) => {
    try {
        const { nomBox, aireBox } = req.body;
        const existingBox = await Box.findOne({ nomBox });
        if (existingBox) {
            return res.status(400).json({ message: "Box déjà existant" });
        }
        const box = await Box.create({ nomBox, aireBox });
        res.status(201).json({
            message: "Box créé",
            box: {
                id: box._id,
                nomBox: box.nomBox,
                aireBox: box.aireBox
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ALL
exports.getAll = async (req, res) => {
    try {
        const boxs = await Box.find();
        res.status(200).json(boxs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const box = await Box.findById(id);
        if (!box) {
            return res.status(404).json({ message: "Box non trouvé" });
        }
        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomBox, aireBox } = req.body;
        const updatedBox = await Box.findByIdAndUpdate(
            id,
            { nomBox, aireBox },
            { new: true, runValidators: true }
        );
        if (!updatedBox) {
            return res.status(404).json({ message: "Box non trouvé" });
        }
        res.status(200).json({
            message: "Box mis à jour",
            box: updatedBox
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBox = await Box.findByIdAndDelete(id);
        if (!deletedBox) {
            return res.status(404).json({ message: "Box non trouvé" });
        }
        res.status(200).json({ message: "Box supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
