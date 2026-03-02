const Panier = require("../models/panier");
const PrixProduit = require("../models/prix-produit");
const Promotion = require("../models/promotion");
const { buildActivePromotionFilters, toPromotionInfo, pickBestPromotion } = require("./promotion.helper");

const getPanierByUser = async (appUser) => {
	if (!appUser) throw new Error("appUser est obligatoire");
	const items = await Panier.find({ appUser })
		.populate({ path: "produit", populate: [{ path: "unite" }, { path: "typeProduit" }, { path: "magasin" }] })
		.sort({ createdAt: -1 });
	const produitIds = items.map(i => i.produit?._id).filter(Boolean);
	const magasinIds = [...new Set(
		items
			.map(i => i?.produit?.magasin?._id || i?.produit?.magasin)
			.filter(Boolean)
			.map(id => String(id))
	)];
	const prixList = await PrixProduit.find({ produit: { $in: produitIds }, dateFin: null });
	const prixMap = {};
	prixList.forEach(px => { prixMap[String(px.produit)] = px.prixUnitaire; });
	
	// Récupérer les promotions actives (sur produit et sur magasin)
	const now = new Date();
	const activeFilters = buildActivePromotionFilters(now);

	const [promotionsProduit, promotionsMagasin] = await Promise.all([
		Promotion.find({
			...activeFilters,
			produit: { $in: produitIds }
		}).lean(),
		magasinIds.length
			? Promotion.find({
				...activeFilters,
				magasin: { $in: magasinIds },
				$or: [{ produit: { $exists: false } }, { produit: null }]
			}).lean()
			: []
	]);

	const bestPromoByProduitId = {};
	for (const promo of promotionsProduit) {
		if (!promo?.produit) continue;
		const produitId = String(promo.produit);
		bestPromoByProduitId[produitId] = pickBestPromotion(
			bestPromoByProduitId[produitId] || null,
			toPromotionInfo(promo)
		);
	}

	const bestPromoByMagasinId = {};
	for (const promo of promotionsMagasin) {
		if (!promo?.magasin) continue;
		const magasinId = String(promo.magasin);
		bestPromoByMagasinId[magasinId] = pickBestPromotion(
			bestPromoByMagasinId[magasinId] || null,
			toPromotionInfo(promo)
		);
	}

	return items.map(item => {
		const plain = item.toObject();
		if (plain.produit) {
			const prixActuel = prixMap[String(plain.produit._id)] ?? null;
			const produitId = String(plain.produit._id);
			const magasinId = plain?.produit?.magasin?._id
				? String(plain.produit.magasin._id)
				: (plain?.produit?.magasin ? String(plain.produit.magasin) : null);
			const promoProduit = bestPromoByProduitId[produitId] || null;
			const promoMagasin = magasinId ? (bestPromoByMagasinId[magasinId] || null) : null;
			const promotion = pickBestPromotion(promoProduit, promoMagasin);
			let prixPromo = null;

			if (promotion && prixActuel) {
				prixPromo = prixActuel * (1 - promotion.pourcentage / 100);
			}

			plain.produit.prixActuel = prixActuel;
			plain.produit.promotion = promotion;
			plain.produit.prixPromo = prixPromo;
		}
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
