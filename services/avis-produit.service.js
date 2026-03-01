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

const modifierAvisProduit = async (avisId, dto = {}) => {
	const { commentaire, nombreEtoile } = dto;

	if (!avisId) {
		throw new Error("avisId est obligatoire");
	}

	const avis = await AvisProduit.findById(avisId);
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

const supprimerAvisProduit = async (avisId, userId) => {
	if (!avisId) {
		throw new Error("avisId est obligatoire");
	}

	const avis = await AvisProduit.findById(avisId);
	if (!avis) {
		throw new Error("Avis non trouve");
	}

	if (String(avis.appUser) !== String(userId)) {
		throw new Error("Vous n'etes pas autorise a supprimer cet avis");
	}

	await AvisProduit.findByIdAndDelete(avisId);
	return { message: "Avis supprime" };
};

module.exports = {
	ajouterAvisProduit,
	modifierAvisProduit,
	supprimerAvisProduit
};