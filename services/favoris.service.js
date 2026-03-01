const Favoris = require("../models/favoris");

const ajouterFavori = async (produit, user) => {

    if (!produit || !user) {
        throw new Error("produit et user sont obligatoires");
    }

    const existing = await Favoris.findOne({ produit, user }).lean();
    if (existing) {
        throw new Error("Favori deja existant");
    }

    const favoris = await Favoris.create({
        produit,
        user,
        dateAjout: new Date()
    });

    return favoris;
};

const supprimerFavori = async (produit, user) => {
    

    if (!produit || !user) {
        throw new Error("produit et user sont obligatoires");
    }

    const deleted = await Favoris.findOneAndDelete({ produit, user });
    if (!deleted) {
        throw new Error("Favori non trouve");
    }

    return deleted;
};

module.exports = {
    ajouterFavori,
    supprimerFavori
};