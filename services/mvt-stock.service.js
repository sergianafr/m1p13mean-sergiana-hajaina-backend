const MvtStock = require("../models/mvt-stock");
const Produit = require("../models/produit");
const mongoose = require("mongoose");

const createMvtStock = async (dto = {}) => {
	const {
		produit,
		unite,
		qteEntree = 0,
		qteSortie = 0,
		dateMvtStock
	} = dto;

	if (!produit || !unite) {
		throw new Error("produit et unite sont obligatoires");
	}

	const entree = Number(qteEntree) || 0;
	const sortie = Number(qteSortie) || 0;

	if (entree > 0 && sortie > 0) {
		throw new Error("qteEntree et qteSortie ne peuvent pas etre fournis ensemble");
	}

	const mvtStock = await MvtStock.create({
		qteEntree: entree,
		qteSortie: sortie,
		dateMvtStock: dateMvtStock ? new Date(dateMvtStock) : new Date(),
		unite,
		produit
	});

	return mvtStock;
};

const getStockByMagasin = async (magasinId) => {
	if (!magasinId) throw new Error("magasinId est obligatoire");

	const produits = await Produit.find({ magasin: magasinId })
		.populate("unite typeProduit magasin")
		.lean();

	const produitIds = produits.map(p => p._id);

	const stockAgg = await MvtStock.aggregate([
		{ $match: { produit: { $in: produitIds } } },
		{
			$group: {
				_id: "$produit",
				totalEntree: { $sum: "$qteEntree" },
				totalSortie: { $sum: "$qteSortie" }
			}
		}
	]);

	const stockMap = {};
	for (const s of stockAgg) {
		stockMap[String(s._id)] = (s.totalEntree || 0) - (s.totalSortie || 0);
	}

	return produits.map(p => ({
		...p,
		stockActuel: stockMap[String(p._id)] || 0
	}));
};

const getStockByProduit = async (produitId) => {
	if (!produitId) throw new Error("produitId est obligatoire");

	const result = await MvtStock.aggregate([
		{ $match: { produit: new mongoose.Types.ObjectId(produitId) } },
		{
			$group: {
				_id: null,
				totalEntree: { $sum: "$qteEntree" },
				totalSortie: { $sum: "$qteSortie" }
			}
		}
	]);

	if (!result.length) return 0;
	return (result[0].totalEntree || 0) - (result[0].totalSortie || 0);
};

const getMvtsByProduit = async (produitId) => {
	if (!produitId) throw new Error("produitId est obligatoire");

	return await MvtStock.find({ produit: produitId })
		.populate("unite produit")
		.sort({ createdAt: -1 })
		.lean();
};

module.exports = {
	createMvtStock,
	getStockByMagasin,
	getStockByProduit,
	getMvtsByProduit
};
