const Produit = require("../models/produit");
const produitService = require("../services/produit.service");

// CREATE
exports.save = async (req, res) => {
    try {
        const produit = await produitService.createProduit(req.body, req.files || []);
        res.status(201).json({ message: "Produit créé", produit });
    } catch (error) {
        const status = error.message === "Produit déjà existant" || error.message.includes("obligatoires") ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

// READ ALL
exports.getAll = async (req, res) => {
    try {
        const produits = await Produit.find().populate("unite typeProduit magasin");
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const produit = await Produit.findById(id).populate("unite typeProduit magasin");
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomProduit, descriptionProduit, seuilNotification, unite, typeProduit, magasin } = req.body;
        const updated = await Produit.findByIdAndUpdate(
            id,
            { nomProduit, descriptionProduit, seuilNotification, unite, typeProduit, magasin },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.status(200).json({ message: "Produit mis à jour", produit: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Produit.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.status(200).json({ message: "Produit supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
