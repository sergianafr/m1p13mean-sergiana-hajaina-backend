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

const modifierAvisMagasin = async (avisId, dto = {}) => {
	const { commentaire, nombreEtoile } = dto;

	if (!avisId) {
		throw new Error("avisId est obligatoire");
	}

	const avis = await AvisMagasin.findById(avisId);
	if (!avis) {
		throw new Error("Avis non trouve");
	}

	if (nombreEtoile !== undefined) {
		const note = Number(nombreEtoile);
		if (Number.isNaN(note) || note < 0 || note > 5) {
			throw new Error("nombreEtoile doit etre entre 0 et 5");
		}
		avis.nombreEtoile = note;
	}

	if (commentaire !== undefined) {
		avis.commentaire = commentaire;
	}

	await avis.save();
	return avis;
};

const supprimerAvisMagasin = async (avisId, userId) => {
	if (!avisId) {
		throw new Error("avisId est obligatoire");
	}

	const avis = await AvisMagasin.findById(avisId);
	if (!avis) {
		throw new Error("Avis non trouve");
	}

	// Vérifier que c'est bien l'auteur de l'avis
	if (String(avis.appUser) !== String(userId)) {
		throw new Error("Vous n'etes pas autorise a supprimer cet avis");
	}

	await AvisMagasin.findByIdAndDelete(avisId);
	return { message: "Avis supprime" };
};

module.exports = {
	ajouterAvisMagasin,
	modifierAvisMagasin,
	supprimerAvisMagasin
};
