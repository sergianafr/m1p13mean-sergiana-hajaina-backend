const Promotion = require("../models/promotion");

const createPromotion = async (dto) => {
	const { qte, pourcentage, dateDebut, dateFin, produit, magasin } = dto;

	if (!dateDebut || !dateFin) {
		throw new Error("dateDebut et dateFin sont obligatoires");
	}

	if (new Date(dateFin) < new Date(dateDebut)) {
		throw new Error("La date de fin doit être supérieur à la date de début");
	}

	if (!produit && !magasin) {
		throw new Error("Au moins un produit ou un magasin doit être spécifié");
	}

	if (pourcentage < 0 || pourcentage > 100) {
		throw new Error("Le pourcentage doit être entre 0 et 100");
	}

	const promotion = await Promotion.create({
		qte: qte ?? -1,
		pourcentage: pourcentage ?? 0,
		dateDebut,
		dateFin,
		produit,
		magasin
	});

	return promotion.populate("produit magasin");
};

const getAllPromotions = async () => {
	return Promotion.find().populate("produit magasin").sort({ createdAt: -1 });
};

const getPromotionById = async (id) => {
	const promotion = await Promotion.findById(id).populate("produit magasin");
	if (!promotion) {
		throw new Error("Promotion non trouvée");
	}
	return promotion;
};

const updatePromotion = async (id, dto) => {
	const { qte, pourcentage, dateDebut, dateFin, produit, magasin } = dto;

	const promotion = await Promotion.findById(id);
	if (!promotion) {
		throw new Error("Promotion non trouvée");
	}

	if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
		throw new Error("La date de fin doit être supérieur à la date de début");
	}

	if (pourcentage !== undefined && (pourcentage < 0 || pourcentage > 100)) {
		throw new Error("Le pourcentage doit être entre 0 et 100");
	}

	if (qte !== undefined) promotion.qte = qte;
	if (pourcentage !== undefined) promotion.pourcentage = pourcentage;
	if (dateDebut) promotion.dateDebut = dateDebut;
	if (dateFin) promotion.dateFin = dateFin;
	if (produit !== undefined) promotion.produit = produit;
	if (magasin !== undefined) promotion.magasin = magasin;

	await promotion.save();
	return promotion.populate("produit magasin");
};

const deletePromotion = async (id) => {
	const promotion = await Promotion.findById(id);
	if (!promotion) {
		throw new Error("Promotion non trouvée");
	}

	await promotion.deleteOne();
	return promotion;
};

const getActivePromotions = async () => {
	const now = new Date();
	return Promotion.find({
		dateDebut: { $lte: now },
		dateFin: { $gte: now }
	}).populate("produit magasin");
};

const getPromotionsByMagasin = async (magasinId) => {
	return Promotion.find({ magasin: magasinId }).populate("produit magasin").sort({ createdAt: -1 });
};

const getPromotionsByProduit = async (produitId) => {
	return Promotion.find({ produit: produitId }).populate("produit magasin").sort({ createdAt: -1 });
};

module.exports = {
	createPromotion,
	getAllPromotions,
	getPromotionById,
	updatePromotion,
	deletePromotion,
	getActivePromotions,
	getPromotionsByMagasin,
	getPromotionsByProduit
};
