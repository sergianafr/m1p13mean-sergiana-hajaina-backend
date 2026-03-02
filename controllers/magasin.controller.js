const Magasin = require("../models/magasin");
const magasinService = require("../services/magasin.service");

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

exports.getMine = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const magasins = await Magasin.find({ appUser: userId }).populate("appUser typeMagasin");
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

// GET ALL WITH RATINGS
exports.getAllWithRatings = async (req, res) => {
    try {
        const magasins = await magasinService.getAllMagasinsWithRatings();
        res.status(200).json(magasins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ONE WITH RATING
exports.getByIdWithRating = async (req, res) => {
    try {
        const { id } = req.params;
        const magasin = await magasinService.getMagasinByIdWithRating(id);
        if (!magasin) {
            return res.status(404).json({ message: "Magasin non trouvé" });
        }
        res.status(200).json(magasin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET PRODUCTS BY MAGASIN
exports.getProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const produits = await magasinService.getProductsByMagasinId(id);
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET REVIEWS BY MAGASIN
exports.getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const avis = await magasinService.getReviewsByMagasinId(id);
        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
