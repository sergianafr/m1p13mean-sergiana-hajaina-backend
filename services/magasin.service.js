const Magasin = require("../models/magasin");
const AvisMagasin = require("../models/avis-magasin");
const Produit = require("../models/produit");

/**
 * Get all magasins with their type and average rating
 */
const getAllMagasinsWithRatings = async () => {
	const magasins = await Magasin.find()
		.populate("appUser", "name email")
		.populate("typeMagasin", "nomTypeMagasin")
		.lean();

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
				totalReviews
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

	return {
		...magasin,
		averageRating: Math.round(averageRating * 10) / 10,
		totalReviews: avis.length
	};
};

/**
 * Get all products for a specific magasin
 */
const getProductsByMagasinId = async (magasinId) => {
	const Produit = require("../models/produit");
	const PrixProduit = require("../models/prix-produit");

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

	const result = produits.map(p => ({ 
		...p, 
		prixActuel: prixMap[String(p._id)] ?? null 
	}));

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
