const PrixProduit = require("../models/prix-produit");

/**
 * Créer un nouveau prix pour un produit
 * Ferme automatiquement l'ancien prix actif (dateFin = dateDebut du nouveau)
 */
const createPrixProduit = async ({ prixUnitaire, dateDebut, produit }) => {
    if (!prixUnitaire || !dateDebut || !produit) {
        throw new Error("prixUnitaire, dateDebut et produit sont obligatoires");
    }

    // Fermer le prix actif (celui sans dateFin)
    await PrixProduit.updateMany(
        { produit, dateFin: null },
        { $set: { dateFin: new Date(dateDebut) } }
    );

    const prix = await PrixProduit.create({
        prixUnitaire,
        dateDebut: new Date(dateDebut),
        dateFin: null,
        produit
    });

    return prix;
};

/**
 * Récupérer l'historique des prix d'un produit
 */
const getPrixByProduit = async (produitId) => {
    return PrixProduit.find({ produit: produitId })
        .sort({ dateDebut: -1 })
        .populate("produit");
};

/**
 * Récupérer le prix actuel d'un produit (celui sans dateFin)
 */
const getCurrentPrix = async (produitId) => {
    return PrixProduit.findOne({ produit: produitId, dateFin: null })
        .sort({ dateDebut: -1 });
};

/**
 * Supprimer un prix
 */
const deletePrix = async (prixId) => {
    const prix = await PrixProduit.findByIdAndDelete(prixId);
    if (!prix) {
        throw new Error("Prix non trouvé");
    }
    return prix;
};

module.exports = {
    createPrixProduit,
    getPrixByProduit,
    getCurrentPrix,
    deletePrix
};
