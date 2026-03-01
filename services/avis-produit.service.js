const AvisProduit = require("../models/avis-produit");

const ajouterAvisProduit = async (dto = {}) => {
	const { produit, appUser, commentaire = "", nombreEtoile = 0 } = dto;

	if (!produit || !appUser) {
		throw new Error("produit et appUser sont obligatoires");
	}

	const note = Number(nombreEtoile);
	if (Number.isNaN(note) || note < 0 || note > 5) {
		throw new Error("nombreEtoile doit etre entre 0 et 5");
	}

	const avis = await AvisProduit.create({
		produit,
		appUser,
		commentaire,
		nombreEtoile: note,
		dateAjout: new Date()
	});

	return avis;
};

module.exports = {
	ajouterAvisProduit
};