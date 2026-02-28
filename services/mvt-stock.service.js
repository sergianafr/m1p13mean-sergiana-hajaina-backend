const MvtStock = require("../models/mvt-stock");

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
		Produit: produit
	});

	return mvtStock;
};

module.exports = {
	createMvtStock
};
