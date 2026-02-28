const Produit = require("../models/produit");
const PrixProduit = require("../models/prix-produit");
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
        const produitIds = produits.map(p => p._id);
        const prixList = await PrixProduit.find({ produit: { $in: produitIds }, dateFin: null });
        const prixMap = {};
        prixList.forEach(px => { prixMap[String(px.produit)] = px.prixUnitaire; });
        const result = produits.map(p => ({ ...p.toObject(), prixActuel: prixMap[String(p._id)] ?? null }));
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
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
        const prix = await PrixProduit.findOne({ produit: id, dateFin: null }).sort({ dateDebut: -1 });
        res.status(200).json({ ...produit.toObject(), prixActuel: prix?.prixUnitaire ?? null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const produit = await produitService.updateProduit(id, req.body, req.files || []);
        res.status(200).json({ message: "Produit mis à jour", produit });
    } catch (error) {
        const status = error.message === "Produit non trouvé" ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

exports.removePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.query;

        const produit = await produitService.deleteProduitPhotoByUrl(id, imageUrl);
        res.status(200).json({ message: "Photo supprimée", produit });
    } catch (error) {
        const status =
            error.message === "produitId et imageUrl sont obligatoires" ||
            error.message === "Photo non trouvée pour ce produit"
                ? 400
                : error.message === "Produit non trouvé"
                    ? 404
                    : 500;
        res.status(status).json({ message: error.message });
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
