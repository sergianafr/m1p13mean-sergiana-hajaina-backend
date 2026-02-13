const TypeMagasin = require("../models/type-magasin");

// CREATE
exports.save = async (req, res) => {
    try {
        const { nomTypeMagasin } = req.body;
        const existingType = await TypeMagasin.findOne({ nomTypeMagasin });
        if (existingType) {
            return res.status(400).json({ message: "Type déjà déjà existant" });
        }
        const typeMagasin = await TypeMagasin.create({ nomTypeMagasin });
        res.status(201).json({
            message: "Type de magasin créé",
            typeMagasin: {
                id: typeMagasin._id,
                nomTypeMagasin: typeMagasin.nomTypeMagasin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ALL
exports.getAll = async (req, res) => {
    try {
        const types = await TypeMagasin.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await TypeMagasin.findById(id);
        if (!type) {
            return res.status(404).json({ message: "Type de magasin non trouvé" });
        }
        res.status(200).json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomTypeMagasin } = req.body;
        const updatedType = await TypeMagasin.findByIdAndUpdate(
            id,
            { nomTypeMagasin },
            { new: true, runValidators: true }
        );
        if (!updatedType) {
            return res.status(404).json({ message: "Type de magasin non trouvé" });
        }
        res.status(200).json({
            message: "Type de magasin mis à jour",
            typeMagasin: updatedType
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedType = await TypeMagasin.findByIdAndDelete(id);
        if (!deletedType) {
            return res.status(404).json({ message: "Type de magasin non trouvé" });
        }
        res.status(200).json({ message: "Type de magasin supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};