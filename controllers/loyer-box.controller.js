const LoyerBox = require("../models/loyer-box");

// CREATE
exports.save = async (req, res) => {
    try {
        const { montantLoyer, dateDebut, dateFin, box } = req.body;
        const loyerBox = await LoyerBox.create({ montantLoyer, dateDebut, dateFin, box });
        res.status(201).json({
            message: "LoyerBox créé",
            loyerBox
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ALL
exports.getAll = async (req, res) => {
    try {
        const loyers = await LoyerBox.find().populate("box");
        res.status(200).json(loyers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const loyer = await LoyerBox.findById(id).populate("box");
        if (!loyer) {
            return res.status(404).json({ message: "LoyerBox non trouvé" });
        }
        res.status(200).json(loyer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { montantLoyer, dateDebut, dateFin, box } = req.body;
        const updated = await LoyerBox.findByIdAndUpdate(
            id,
            { montantLoyer, dateDebut, dateFin, box },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "LoyerBox non trouvé" });
        }
        res.status(200).json({ message: "LoyerBox mis à jour", loyerBox: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await LoyerBox.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "LoyerBox non trouvé" });
        }
        res.status(200).json({ message: "LoyerBox supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
