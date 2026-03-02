const Produit = require("../models/produit");
const PrixProduit = require("../models/prix-produit");
const AvisProduit = require("../models/avis-produit");
const Promotion = require("../models/promotion");
const cloudinary = require("cloudinary").v2;
const { deleteImageFromCloudinaryByUrl, uploadSingleFileToCloudinary } = require("./cloudinary.service");
const { buildActivePromotionFilters, toPromotionInfo, pickBestPromotion } = require("./promotion.helper");

cloudinary.config({ secure: true });

const uploadPhotosToCloudinary = async (files = []) => {
	if (!files.length) {
		return [];
	}

	return Promise.all(files.map((file) => uploadSingleFileToCloudinary(file, "produits", "image")));
};

const createProduit = async (dto, files = []) => {
	const {
		nomProduit,
		descriptionProduit,
		seuilNotification,
		unite,
		typeProduit,
		magasin,
		prixUnitaire
	} = dto;

	if (!nomProduit || !unite || !typeProduit || !magasin) {
		throw new Error("nomProduit, unite, typeProduit et magasin sont obligatoires");
	}

	const existing = await Produit.findOne({ nomProduit }).lean();
	if (existing) {
		throw new Error("Produit déjà existant");
	}

	const photos = await uploadPhotosToCloudinary(files);

	const produit = await Produit.create({
		nomProduit,
		descriptionProduit,
		seuilNotification,
		unite,
		typeProduit,
		magasin,
		photos
	});

	// Créer le prix initial si fourni
	if (prixUnitaire && parseFloat(prixUnitaire) > 0) {
		await PrixProduit.create({
			prixUnitaire: parseFloat(prixUnitaire),
			dateDebut: new Date(),
			dateFin: null,
			produit: produit._id
		});
	}

	return produit;
};

const updateProduit = async (produitId, dto, files = []) => {
	if (!produitId) {
		throw new Error("produitId est obligatoire");
	}

	const produit = await Produit.findById(produitId);
	if (!produit) {
		throw new Error("Produit non trouvé");
	}

	const { nomProduit, descriptionProduit, seuilNotification, unite, typeProduit, magasin } = dto;

	if (nomProduit) produit.nomProduit = nomProduit;
	if (descriptionProduit !== undefined) produit.descriptionProduit = descriptionProduit;
	if (seuilNotification !== undefined) produit.seuilNotification = seuilNotification;
	if (unite) produit.unite = unite;
	if (typeProduit) produit.typeProduit = typeProduit;
	if (magasin) produit.magasin = magasin;

	if (files && files.length > 0) {
		const newPhotos = await uploadPhotosToCloudinary(files);
		produit.photos = [...(produit.photos || []), ...newPhotos];
	}

	await produit.save();
	return produit;
};

const deleteProduitPhotoByUrl = async (produitId, imageUrl) => {
	if (!produitId || !imageUrl) {
		throw new Error("produitId et imageUrl sont obligatoires");
	}

	const produit = await Produit.findById(produitId);
	if (!produit) {
		throw new Error("Produit non trouvé");
	}

	const hasPhoto = produit.photos?.some((photo) => photo?.url === imageUrl);
	if (!hasPhoto) {
		throw new Error("Photo non trouvée pour ce produit");
	}

	await deleteImageFromCloudinaryByUrl(imageUrl);

	produit.photos = (produit.photos || []).filter((photo) => photo?.url !== imageUrl);
	await produit.save();

	return produit;
};

// Calculer la moyenne des notes pour tous les produits
const getAllProduitsWithRatings = async () => {
	const produits = await Produit.find().populate("unite typeProduit magasin").lean();
	const produitIds = produits.map((p) => p._id);
	const magasinIds = [...new Set(
		produits
			.map((p) => p?.magasin?._id || p?.magasin)
			.filter(Boolean)
			.map((id) => String(id))
	)];

	// Récupérer tous les avis pour ces produits
	const avis = await AvisProduit.find({ produit: { $in: produitIds } }).lean();

	// Calculer les moyennes
	const ratingsMap = {};
	produitIds.forEach((id) => {
		const avisProduit = avis.filter((a) => String(a.produit) === String(id));
		const totalReviews = avisProduit.length;
		const averageRating =
			totalReviews > 0
				? avisProduit.reduce((sum, a) => sum + a.nombreEtoile, 0) / totalReviews
				: 0;
		ratingsMap[String(id)] = { averageRating, totalReviews };
	});

	// Récupérer les prix actuels
	const prixList = await PrixProduit.find({ produit: { $in: produitIds }, dateFin: null }).lean();
	const prixMap = {};
	prixList.forEach((px) => {
		prixMap[String(px.produit)] = px.prixUnitaire;
	});

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

	return produits.map((p) => {
		const prixActuel = prixMap[String(p._id)] ?? null;
		const produitId = String(p._id);
		const magasinId = p?.magasin?._id ? String(p.magasin._id) : (p?.magasin ? String(p.magasin) : null);
		const promoProduit = bestPromoByProduitId[produitId] || null;
		const promoMagasin = magasinId ? (bestPromoByMagasinId[magasinId] || null) : null;
		const promotion = pickBestPromotion(promoProduit, promoMagasin);
		let prixPromo = null;

		if (promotion && prixActuel) {
			prixPromo = prixActuel * (1 - promotion.pourcentage / 100);
		}

		return {
			...p,
			averageRating: ratingsMap[String(p._id)]?.averageRating || 0,
			totalReviews: ratingsMap[String(p._id)]?.totalReviews || 0,
			prixActuel: prixActuel,
			promotion: promotion,
			prixPromo: prixPromo
		};
	});
};

// Récupérer un produit avec sa note moyenne
const getProduitByIdWithRating = async (produitId) => {
	if (!produitId) {
		throw new Error("produitId est obligatoire");
	}

	const produit = await Produit.findById(produitId).populate("unite typeProduit magasin").lean();
	if (!produit) {
		throw new Error("Produit non trouvé");
	}

	const avis = await AvisProduit.find({ produit: produitId }).lean();
	const totalReviews = avis.length;
	const averageRating =
		totalReviews > 0
			? avis.reduce((sum, a) => sum + a.nombreEtoile, 0) / totalReviews
			: 0;

	const prix = await PrixProduit.findOne({ produit: produitId, dateFin: null })
		.sort({ dateDebut: -1 })
		.lean();

	// Récupérer la promotion active (max entre promo produit et promo magasin)
	const now = new Date();
	const activeFilters = buildActivePromotionFilters(now);

	const [promotionProduit, promotionMagasin] = await Promise.all([
		Promotion.findOne({
			...activeFilters,
			produit: produitId
		})
			.sort({ pourcentage: -1, dateDebut: -1 })
			.lean(),
		produit?.magasin?._id
			? Promotion.findOne({
				...activeFilters,
				magasin: produit.magasin._id,
				$or: [{ produit: { $exists: false } }, { produit: null }]
			})
				.sort({ pourcentage: -1, dateDebut: -1 })
				.lean()
			: null
	]);

	const promotion = pickBestPromotion(toPromotionInfo(promotionProduit), toPromotionInfo(promotionMagasin));

	const prixActuel = prix?.prixUnitaire ?? null;
	let prixPromo = null;

	if (promotion && prixActuel) {
		prixPromo = prixActuel * (1 - Number(promotion.pourcentage || 0) / 100);
	}

	return {
		...produit,
		averageRating,
		totalReviews,
		prixActuel: prixActuel,
		promotion: promotion,
		prixPromo: prixPromo
	};
};

// Récupérer tous les avis d'un produit avec les informations des utilisateurs
const getReviewsByProduitId = async (produitId) => {
	if (!produitId) {
		throw new Error("produitId est obligatoire");
	}

	const avis = await AvisProduit.find({ produit: produitId })
		.populate("appUser", "name")
		.sort({ dateAjout: -1 })
		.lean();

	return avis;
};


module.exports = {
	createProduit,
	updateProduit,
	deleteProduitPhotoByUrl,
	getAllProduitsWithRatings,
	getProduitByIdWithRating,
	getReviewsByProduitId
};
