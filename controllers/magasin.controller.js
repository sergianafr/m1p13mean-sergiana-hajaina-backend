const Magasin = require("../models/magasin");

// CREATE
exports.save = async (req, res) => {
    try {
        const { nomMagasin, dateAjout, nif, stat, appUser, typeMagasin } = req.body;
        const existing = await Magasin.findOne({ nomMagasin });
        if (existing) {
            return res.status(400).json({ message: "Magasin déjà existant" });
        }
        const magasin = await Magasin.create({ nomMagasin, dateAjout, nif, stat, appUser, typeMagasin });
        res.status(201).json({ message: "Magasin créé", magasin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ALL
exports.getAll = async (req, res) => {
    try {
        const magasins = await Magasin.find().populate("appUser typeMagasin");
        res.status(200).json(magasins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const magasin = await Magasin.findById(id).populate("appUser typeMagasin");
        if (!magasin) {
            return res.status(404).json({ message: "Magasin non trouvé" });
        }
        res.status(200).json(magasin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomMagasin, dateAjout, nif, stat, appUser, typeMagasin } = req.body;
        const updated = await Magasin.findByIdAndUpdate(
            id,
            { nomMagasin, dateAjout, nif, stat, appUser, typeMagasin },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Magasin non trouvé" });
        }
        res.status(200).json({ message: "Magasin mis à jour", magasin: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Magasin.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Magasin non trouvé" });
        }
        res.status(200).json({ message: "Magasin supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
