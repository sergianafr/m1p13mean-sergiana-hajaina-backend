const Favoris = require("../models/favoris");

const getFavorisByUser = async (appUser) => {
    if (!appUser) throw new Error("appUser est obligatoire");
    return await Favoris.find({ appUser })
        .populate({ path: "produit", populate: [{ path: "unite" }, { path: "typeProduit" }, { path: "magasin" }] })
        .sort({ dateAjout: -1 });
};

const ajouterFavori = async (dto = {}) => {
    const { produit, appUser } = dto;

    if (!produit || !appUser) {
        throw new Error("produit et appUser sont obligatoires");
    }

    const existing = await Favoris.findOne({ produit, appUser }).lean();
    if (existing) {
        throw new Error("Favori deja existant");
    }

    const favoris = await Favoris.create({
        produit,
        appUser,
        dateAjout: new Date()
    });

    return favoris;
};

const supprimerFavori = async (dto = {}) => {
    const { produit, appUser } = dto;

    if (!produit || !appUser) {
        throw new Error("produit et appUser sont obligatoires");
    }

    const deleted = await Favoris.findOneAndDelete({ produit, appUser });
    if (!deleted) {
        throw new Error("Favori non trouve");
    }

    return deleted;
};

module.exports = {
    getFavorisByUser,
    ajouterFavori,
    supprimerFavori
};