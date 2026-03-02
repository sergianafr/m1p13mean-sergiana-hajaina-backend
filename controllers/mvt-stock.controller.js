const mvtStockService = require("../services/mvt-stock.service");

exports.create = async (req, res) => {
	try {
		const mvtStock = await mvtStockService.createMvtStock(req.body);
		res.status(201).json({ message: "Mouvement de stock cree", mvtStock });
	} catch (error) {
		const status = error.message.includes("obligatoires") || error.message.includes("ensemble")
			? 400
			: 500;
		res.status(status).json({ message: error.message });
	}
};

exports.getByMagasin = async (req, res) => {
	try {
		const { magasinId } = req.params;
		const stock = await mvtStockService.getStockByMagasin(magasinId);
		res.status(200).json(stock);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.getByProduit = async (req, res) => {
	try {
		const { produitId } = req.params;
		const stock = await mvtStockService.getStockByProduit(produitId);
		res.status(200).json({ stock });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.getMvtsByProduit = async (req, res) => {
	try {
		const { produitId } = req.params;
		const mvts = await mvtStockService.getMvtsByProduit(produitId);
		res.status(200).json(mvts);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
