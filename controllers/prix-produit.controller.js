const prixProduitService = require("../services/prix-produit.service");

// CREATE
exports.create = async (req, res) => {
    try {
        const prix = await prixProduitService.createPrixProduit(req.body);
        res.status(201).json({ message: "Prix créé", prix });
    } catch (error) {
        const status = error.message.includes("obligatoires") ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

// GET BY PRODUIT
exports.getByProduit = async (req, res) => {
    try {
        const { produitId } = req.params;
        const prix = await prixProduitService.getPrixByProduit(produitId);
        res.status(200).json(prix);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET CURRENT PRIX
exports.getCurrentPrix = async (req, res) => {
    try {
        const { produitId } = req.params;
        const prix = await prixProduitService.getCurrentPrix(produitId);
        if (!prix) {
            return res.status(404).json({ message: "Aucun prix actif pour ce produit" });
        }
        res.status(200).json(prix);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        await prixProduitService.deletePrix(id);
        res.status(200).json({ message: "Prix supprimé" });
    } catch (error) {
        const status = error.message === "Prix non trouvé" ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};
