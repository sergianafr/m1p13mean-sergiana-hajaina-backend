const AvisMagasin = require("../models/avis-magasin");

const ajouterAvisMagasin = async (dto = {}) => {
	const { magasin, appUser, commentaire = "", nombreEtoile = 0 } = dto;

	if (!magasin || !appUser) {
		throw new Error("magasin et appUser sont obligatoires");
	}

	const note = Number(nombreEtoile);
	if (Number.isNaN(note) || note < 0 || note > 5) {
		throw new Error("nombreEtoile doit etre entre 0 et 5");
	}

	const avis = await AvisMagasin.create({
		magasin,
		appUser,
		commentaire,
		nombreEtoile: note,
		dateAjout: new Date()
	});

	return avis;
};

module.exports = {
	ajouterAvisMagasin
};
