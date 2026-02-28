const mongoose = require("mongoose");
const Vente = require("../models/vente");
const VenteDetail = require("../models/vente-detail");
const Produit = require("../models/produit");
const PrixProduit = require("../models/prix-produit");
const Promotion = require("../models/promotion");
const MvtStock = require("../models/mvt-stock");

const getProduitStock = async (produitId, uniteId, session) => {
	const result = await MvtStock.aggregate([
		{ $match: { produit: new mongoose.Types.ObjectId(produitId), unite: new mongoose.Types.ObjectId(uniteId) } },
		{
			$group: {
				_id: null,
				totalEntree: { $sum: "$qteEntree" },
				totalSortie: { $sum: "$qteSortie" }
			}
		}
	]).session(session);

	if (!result.length) {
		return 0;
	}

	return (result[0].totalEntree || 0) - (result[0].totalSortie || 0);
};

const getPrixUnitaireByDate = async (produitId, dateVente, session) => {
	const prix = await PrixProduit.findOne({
		produit: produitId,
		dateDebut: { $lte: dateVente },
		$or: [{ dateFin: null }, { dateFin: { $gte: dateVente } }]
	})
		.sort({ dateDebut: -1 })
		.session(session)
		.lean();

	if (!prix) {
		throw new Error("Aucun prix actif pour ce produit a la date de vente");
	}

	return Number(prix.prixUnitaire);
};

const findPromotionForDetail = async ({ produitId, dateVente }, session) => {
	const dateFilter = { dateDebut: { $lte: dateVente }, dateFin: { $gte: dateVente } };
	const qteFilter = { $or: [{ qte: { $gt: 0 } }, { qte: { $lt: 0 } }] };

	const promotionProduit = await Promotion.findOne({
		...dateFilter,
		...qteFilter,
		produit: produitId
	})
		.sort({ pourcentage: -1, dateDebut: -1 })
		.session(session);

	return promotionProduit;
};

const findPromotionForVente = async ({ magasinId, dateVente }, session) => {
	const dateFilter = { dateDebut: { $lte: dateVente }, dateFin: { $gte: dateVente } };
	const qteFilter = { $or: [{ qte: { $gt: 0 } }, { qte: { $lt: 0 } }] };

return await Promotion.findOne({
		...dateFilter,
		...qteFilter,
		magasin: magasinId,
		$or: [{ produit: { $exists: false } }, { produit: null }]
	})
		.sort({ pourcentage: -1, dateDebut: -1 })
		.session(session);
};

const applyPromotionToDetail = async ({
	produitId,
	qte,
	prixUnitaire,
	dateVente,
	session
}) => {
	const promotion = await findPromotionForDetail({ produitId, dateVente }, session);

	if (!promotion || Number(promotion.pourcentage) <= 0) {
		return { prixTotal: qte * prixUnitaire, promotion: null };
	}

	const pourcentage = Number(promotion.pourcentage) || 0;
	const prixTotal = qte * prixUnitaire * (1 - (pourcentage / 100));

	return { prixTotal, promotion };
};

const createVente = async (dto = {}) => {
	const { magasin, appUser, dateVente, details = [] } = dto;

	if (!magasin || !appUser) {
		throw new Error("magasin et appUser sont obligatoires");
	}

	if (!Array.isArray(details) || details.length === 0) {
		throw new Error("details est obligatoire");
	}

	const venteDate = dateVente ? new Date(dateVente) : new Date();
	const session = await mongoose.startSession();

	try {
		let venteResult;

		await session.withTransaction(async () => {
			const [vente] = await Vente.create(
				[
					{
						magasin,
						appUser,
						dateVente: venteDate,
						totalPrix: 0
					}
				],
				{ session }
			);

			let totalVente = 0;
			const detailDocs = [];
			const promotionsUsed = new Map();
			const promotionVente = await findPromotionForVente({ magasinId: magasin, dateVente: venteDate }, session);

			for (const detail of details) {
				const { produit, qte } = detail || {};

				if (!produit || !qte || Number(qte) <= 0) {
					throw new Error("produit et qte sont obligatoires pour chaque detail");
				}

				const produitDoc = await Produit.findById(produit)
					.select("unite magasin")
					.session(session)
					.lean();

				if (!produitDoc) {
					throw new Error("Produit non trouve");
				}

				if (String(produitDoc.magasin) !== String(magasin)) {
					throw new Error("Produit non associe au magasin de la vente");
				}

				const stockDisponible = await getProduitStock(produit, produitDoc.unite, session);
				if (stockDisponible < Number(qte)) {
					throw new Error("Stock insuffisant pour ce produit");
				}

				const prixUnitaire = await getPrixUnitaireByDate(produit, venteDate, session);
				let prixTotal;
				let promotion = null;

				if (!promotionVente) {
					const promoResult = await applyPromotionToDetail({
						produitId: produit,
						qte: Number(qte),
						prixUnitaire,
						dateVente: venteDate,
						session
					});

					prixTotal = promoResult.prixTotal;
					promotion = promoResult.promotion;

					if (promotion) {
						promotionsUsed.set(String(promotion._id), promotion);
					}
				} else {
					prixTotal = Number(qte) * prixUnitaire;
				}

				await MvtStock.create(
					[
						{
							qteEntree: 0,
							qteSortie: Number(qte),
							dateMvtStock: venteDate,
							unite: produitDoc.unite,
							produit
						}
					],
					{ session }
				);

				detailDocs.push({
					qte: Number(qte),
					prixUnitaire,
					prixTotal,
					pourcentagePromotion: promotion ? Number(promotion.pourcentage) || 0 : 0,
					vente: vente._id,
					produit
				});

				totalVente += prixTotal;
			}

			if (promotionVente) {
				promotionsUsed.set(String(promotionVente._id), promotionVente);
			}

			for (const promotion of promotionsUsed.values()) {
				if (promotion.qte > 0) {
					const updateResult = await Promotion.updateOne(
						{ _id: promotion._id, qte: { $gte: 1 } },
						{ $inc: { qte: -1 } },
						{ session }
					);

					if (updateResult.matchedCount === 0) {
						throw new Error("Promotion epuissee");
					}
				}
			}

			const pourcentagePromotionVente = promotionVente ? Number(promotionVente.pourcentage) || 0 : 0;
			const totalVenteAvecPromo = promotionVente
				? totalVente * (1 - (pourcentagePromotionVente / 100))
				: totalVente;

			const createdDetails = await VenteDetail.create(detailDocs, { session });
			const updatedVente = await Vente.findByIdAndUpdate(
				vente._id,
				{ totalPrix: totalVenteAvecPromo, pourcentagePromotion: pourcentagePromotionVente },
				{ new: true, session }
			);

			venteResult = { vente: updatedVente, details: createdDetails };
		});

		return venteResult;
	} finally {
		session.endSession();
	}
};

const createAchat = async (details = [], appUser) => {
		if (!appUser) {
			throw new Error("appUser est obligatoire");
		}

		if (!Array.isArray(details) || details.length === 0) {
			throw new Error("details est obligatoire");
		}

		const produitIds = details.map((detail) => detail?.produit).filter(Boolean);
		if (produitIds.length !== details.length) {
			throw new Error("produit est obligatoire pour chaque detail");
		}

		const produits = await Produit.find({ _id: { $in: produitIds } })
			.select("magasin")
			.lean();

		if (produits.length !== produitIds.length) {
			throw new Error("Produit non trouve");
		}

		const produitToMagasin = new Map();
		for (const produit of produits) {
			produitToMagasin.set(String(produit._id), String(produit.magasin));
		}

		const grouped = new Map();
		for (const detail of details) {
			const { produit, qte } = detail || {};

			if (!produit || !qte || Number(qte) <= 0) {
				throw new Error("produit et qte sont obligatoires pour chaque detail");
			}

			const magasinId = produitToMagasin.get(String(produit));
			if (!magasinId) {
				throw new Error("Produit non trouve");
			}

			if (!grouped.has(magasinId)) {
				grouped.set(magasinId, []);
			}

			grouped.get(magasinId).push({ produit, qte: Number(qte) });
		}

		const ventes = [];
		for (const [magasinId, detailsMagasin] of grouped.entries()) {
			const venteResult = await createVente({
				magasin: magasinId,
				appUser,
				dateVente: new Date(),
				details: detailsMagasin
			});

			ventes.push(venteResult);
		}

		return ventes;
	}

const getVentesByUser = async (appUser) => {
	if (!appUser) throw new Error("appUser est obligatoire");

	const ventes = await Vente.find({ appUser })
		.populate("magasin")
		.sort({ createdAt: -1 })
		.lean();

	const venteIds = ventes.map(v => v._id);
	const details = await VenteDetail.find({ vente: { $in: venteIds } })
		.populate({ path: "produit", populate: [{ path: "unite" }, { path: "typeProduit" }, { path: "magasin" }] })
		.lean();

	const detailsByVente = {};
	for (const d of details) {
		const vid = String(d.vente);
		if (!detailsByVente[vid]) detailsByVente[vid] = [];
		detailsByVente[vid].push(d);
	}

	return ventes.map(v => ({
		...v,
		details: detailsByVente[String(v._id)] || []
	}));
};

module.exports = {
	createVente,
	createAchat,
	getVentesByUser
};
