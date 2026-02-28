const Panier = require("../models/panier");

const ajouterPanier = async (dto = {}) => {
	const { produit, appUser, qte = 1 } = dto;

	if (!produit || !appUser) {
		throw new Error("produit et appUser sont obligatoires");
	}

	const quantite = Number(qte) || 1;
	if (quantite <= 0) {
		throw new Error("qte doit etre superieur a 0");
	}

	const existing = await Panier.findOne({ produit, appUser });
	if (existing) {
		existing.qte = (Number(existing.qte) || 0) + quantite;
		await existing.save();
		return existing;
	}

	const panier = await Panier.create({
		produit,
		appUser,
		qte: quantite
	});

	return panier;
};

const supprimerPanier = async (dto = {}) => {
	const { produit, appUser } = dto;

	if (!produit || !appUser) {
		throw new Error("produit et appUser sont obligatoires");
	}

	const deleted = await Panier.findOneAndDelete({ produit, appUser });
	if (!deleted) {
		throw new Error("Panier non trouve");
	}

	return deleted;
};

module.exports = {
	ajouterPanier,
	supprimerPanier
};
