const promotionService = require("../services/promotion.service");

// CREATE
exports.save = async (req, res) => {
	try {
		const promotion = await promotionService.createPromotion(req.body);
		res.status(201).json({ message: "Promotion créée", promotion });
	} catch (error) {
		const status = error.message.includes("obligatoires") || error.message.includes("doit être") || error.message.includes("pourcentage") ? 400 : 500;
		res.status(status).json({ message: error.message });
	}
};

// READ ALL
exports.getAll = async (req, res) => {
	try {
		const promotions = await promotionService.getAllPromotions();
		res.status(200).json(promotions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ONE
exports.getById = async (req, res) => {
	try {
		const promotion = await promotionService.getPromotionById(req.params.id);
		res.status(200).json(promotion);
	} catch (error) {
		const status = error.message === "Promotion non trouvée" ? 404 : 500;
		res.status(status).json({ message: error.message });
	}
};

// UPDATE
exports.update = async (req, res) => {
	try {
		const promotion = await promotionService.updatePromotion(req.params.id, req.body);
		res.status(200).json({ message: "Promotion modifiée", promotion });
	} catch (error) {
		const status = error.message === "Promotion non trouvée" ? 404 : error.message.includes("doit être") || error.message.includes("pourcentage") ? 400 : 500;
		res.status(status).json({ message: error.message });
	}
};

// DELETE
exports.remove = async (req, res) => {
	try {
		await promotionService.deletePromotion(req.params.id);
		res.status(200).json({ message: "Promotion supprimée" });
	} catch (error) {
		const status = error.message === "Promotion non trouvée" ? 404 : 500;
		res.status(status).json({ message: error.message });
	}
};

// GET ACTIVE PROMOTIONS
exports.getActive = async (req, res) => {
	try {
		const promotions = await promotionService.getActivePromotions();
		res.status(200).json(promotions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET BY MAGASIN
exports.getByMagasin = async (req, res) => {
	try {
		const promotions = await promotionService.getPromotionsByMagasin(req.params.magasinId);
		res.status(200).json(promotions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET BY PRODUIT
exports.getByProduit = async (req, res) => {
	try {
		const promotions = await promotionService.getPromotionsByProduit(req.params.produitId);
		res.status(200).json(promotions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
