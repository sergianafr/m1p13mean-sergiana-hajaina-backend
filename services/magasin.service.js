const Magasin = require("../models/magasin");
const AvisMagasin = require("../models/avis-magasin");
const Produit = require("../models/produit");
const PrixProduit = require("../models/prix-produit");
const Promotion = require("../models/promotion");
const { buildActivePromotionFilters, toPromotionInfo, pickBestPromotion } = require("./promotion.helper");

/**
 * Get all magasins with their type and average rating
 */
const getAllMagasinsWithRatings = async () => {
	const magasins = await Magasin.find()
		.populate("appUser", "name email")
		.populate("typeMagasin", "nomTypeMagasin")
		.lean();

	const magasinIds = magasins.map((magasin) => magasin._id);
	const activeFilters = buildActivePromotionFilters(new Date());

	const promotionsMagasin = await Promotion.find({
		...activeFilters,
		magasin: { $in: magasinIds },
		$or: [{ produit: { $exists: false } }, { produit: null }]
	}).lean();

	const bestPromoByMagasinId = {};
	for (const promo of promotionsMagasin) {
		if (!promo?.magasin) continue;
		const magasinId = String(promo.magasin);
		bestPromoByMagasinId[magasinId] = pickBestPromotion(
			bestPromoByMagasinId[magasinId] || null,
			toPromotionInfo(promo)
		);
	}

	// For each magasin, calculate average rating
	const magasinsWithRatings = await Promise.all(
		magasins.map(async (magasin) => {
			const avis = await AvisMagasin.find({ magasin: magasin._id }).lean();
			const averageRating = avis.length > 0
				? avis.reduce((sum, a) => sum + a.nombreEtoile, 0) / avis.length
				: 0;
			const totalReviews = avis.length;

			return {
				...magasin,
				averageRating: Math.round(averageRating * 10) / 10,
				totalReviews,
				promotion: bestPromoByMagasinId[String(magasin._id)] || null
			};
		})
	);

	return magasinsWithRatings;
};

/**
 * Get magasin by ID with average rating
 */
const getMagasinByIdWithRating = async (id) => {
	const magasin = await Magasin.findById(id)
		.populate("appUser", "name email")
		.populate("typeMagasin", "nomTypeMagasin")
		.lean();

	if (!magasin) {
		return null;
	}

	const avis = await AvisMagasin.find({ magasin: id }).lean();
	const averageRating = avis.length > 0
		? avis.reduce((sum, a) => sum + a.nombreEtoile, 0) / avis.length
		: 0;

	const activeFilters = buildActivePromotionFilters(new Date());
	const promotionMagasin = await Promotion.findOne({
		...activeFilters,
		magasin: id,
		$or: [{ produit: { $exists: false } }, { produit: null }]
	})
		.sort({ pourcentage: -1, dateDebut: -1 })
		.lean();

	return {
		...magasin,
		averageRating: Math.round(averageRating * 10) / 10,
		totalReviews: avis.length,
		promotion: toPromotionInfo(promotionMagasin)
	};
};

/**
 * Get all products for a specific magasin
 */
const getProductsByMagasinId = async (magasinId) => {
	const produits = await Produit.find({ magasin: magasinId })
		.populate("unite", "nomUnite")
		.populate("typeProduit", "nomTypeProduit")
		.populate("magasin", "nomMagasin")
		.lean();

	// For each product, get the current price
	const produitIds = produits.map(p => p._id);
	const prixList = await PrixProduit.find({ 
		produit: { $in: produitIds }, 
		dateFin: null 
	}).lean();

	const prixMap = {};
	prixList.forEach(px => { 
		prixMap[String(px.produit)] = px.prixUnitaire; 
	});

	const activeFilters = buildActivePromotionFilters(new Date());

	const [promotionsProduit, promotionMagasin] = await Promise.all([
		Promotion.find({
			...activeFilters,
			produit: { $in: produitIds }
		}).lean(),
		Promotion.findOne({
			...activeFilters,
			magasin: magasinId,
			$or: [{ produit: { $exists: false } }, { produit: null }]
		})
			.sort({ pourcentage: -1, dateDebut: -1 })
			.lean()
	]);

	const promoMagasinInfo = toPromotionInfo(promotionMagasin);

	const bestPromoByProduitId = {};
	for (const promo of promotionsProduit) {
		if (!promo?.produit) continue;
		const produitId = String(promo.produit);
		bestPromoByProduitId[produitId] = pickBestPromotion(
			bestPromoByProduitId[produitId] || null,
			toPromotionInfo(promo)
		);
	}

	const result = produits.map(p => {
		const prixActuel = prixMap[String(p._id)] ?? null;
		const promoProduit = bestPromoByProduitId[String(p._id)] || null;
		const promotion = pickBestPromotion(promoProduit, promoMagasinInfo);
		let prixPromo = null;

		if (promotion && prixActuel !== null && prixActuel !== undefined) {
			prixPromo = prixActuel * (1 - Number(promotion.pourcentage || 0) / 100);
		}

		return {
			...p,
			prixActuel,
			promotion,
			prixPromo
		};
	});

	return result;
};

/**
 * Get all reviews for a specific magasin
 */
const getReviewsByMagasinId = async (magasinId) => {
	const avis = await AvisMagasin.find({ magasin: magasinId })
		.populate("appUser", "name email")
		.sort({ dateAjout: -1 })
		.lean();

	return avis;
};

module.exports = {
	getAllMagasinsWithRatings,
	getMagasinByIdWithRating,
	getProductsByMagasinId,
	getReviewsByMagasinId
};
