const Panier = require("../models/panier");
const PrixProduit = require("../models/prix-produit");

const getPanierByUser = async (appUser) => {
	if (!appUser) throw new Error("appUser est obligatoire");
	const items = await Panier.find({ appUser })
		.populate({ path: "produit", populate: [{ path: "unite" }, { path: "typeProduit" }, { path: "magasin" }] })
		.sort({ createdAt: -1 });
	const produitIds = items.map(i => i.produit?._id).filter(Boolean);
	const prixList = await PrixProduit.find({ produit: { $in: produitIds }, dateFin: null });
	const prixMap = {};
	prixList.forEach(px => { prixMap[String(px.produit)] = px.prixUnitaire; });
	return items.map(item => {
		const plain = item.toObject();
		if (plain.produit) plain.produit.prixActuel = prixMap[String(plain.produit._id)] ?? null;
		return plain;
	});
};

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

const modifierQtePanier = async (dto = {}) => {
	const { produit, appUser, qte } = dto;

	if (!produit || !appUser) {
		throw new Error("produit et appUser sont obligatoires");
	}

	const quantite = Number(qte) || 1;
	if (quantite <= 0) {
		throw new Error("qte doit etre superieur a 0");
	}

	const existing = await Panier.findOne({ produit, appUser });
	if (!existing) {
		throw new Error("Panier non trouve");
	}

	existing.qte = quantite;
	await existing.save();
	return existing;
};

const viderPanierByUser = async (appUser) => {
	if (!appUser) throw new Error("appUser est obligatoire");
	return await Panier.deleteMany({ appUser });
};

module.exports = {
	getPanierByUser,
	ajouterPanier,
	supprimerPanier,
	modifierQtePanier,
	viderPanierByUser
};
