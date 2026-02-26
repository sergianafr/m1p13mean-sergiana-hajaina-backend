const MagasinBox = require("../models/magasin-box");

const MAX_DATE = new Date('9999-12-31T23:59:59.999Z');

function buildOverlapQuery({ box, dateDebut, dateFin, excludeId }) {
    const newStart = new Date(dateDebut);
    const newEnd = dateFin ? new Date(dateFin) : null;

    const query = {
        box,
        $and: [
            { dateDebut: { $lte: newEnd ?? MAX_DATE } },
            { $or: [{ dateFin: null }, { dateFin: { $gte: newStart } }] }
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return query;
}

// CREATE
exports.save = async (req, res) => {
    try {
        const { magasin, box, dateDebut, dateFin } = req.body;
        const existing = await MagasinBox.findOne({ magasin, box });
        if (existing) {
            return res.status(400).json({ message: "Association Magasin-Box déjà existante" });
        }

        const overlap = await MagasinBox.findOne(
            buildOverlapQuery({ box, dateDebut, dateFin })
        );
        if (overlap) {
            return res.status(400).json({
                message: "Ce box est déjà occupé par un autre magasin sur cette période"
            });
        }

        const magasinBox = await MagasinBox.create({ magasin, box, dateDebut, dateFin });
        res.status(201).json({ message: "MagasinBox créé", magasinBox });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ALL
exports.getAll = async (req, res) => {
    try {
        const associations = await MagasinBox.find().populate("magasin box");
        res.status(200).json(associations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const association = await MagasinBox.findById(id).populate("magasin box");
        if (!association) {
            return res.status(404).json({ message: "MagasinBox non trouvé" });
        }
        res.status(200).json(association);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { magasin, box, dateDebut, dateFin } = req.body;

        const existingPair = await MagasinBox.findOne({ _id: { $ne: id }, magasin, box });
        if (existingPair) {
            return res.status(400).json({ message: "Association Magasin-Box déjà existante" });
        }

        const overlap = await MagasinBox.findOne(
            buildOverlapQuery({ box, dateDebut, dateFin, excludeId: id })
        );
        if (overlap) {
            return res.status(400).json({
                message: "Ce box est déjà occupé par un autre magasin sur cette période"
            });
        }

        const updated = await MagasinBox.findByIdAndUpdate(
            id,
            { magasin, box, dateDebut, dateFin },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "MagasinBox non trouvé" });
        }
        res.status(200).json({ message: "MagasinBox mis à jour", magasinBox: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await MagasinBox.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "MagasinBox non trouvé" });
        }
        res.status(200).json({ message: "MagasinBox supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
