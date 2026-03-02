const mongoose = require("mongoose");

const Magasin = require("../models/magasin");
const Produit = require("../models/produit");
const Vente = require("../models/vente");
const VenteDetail = require("../models/vente-detail");
const Promotion = require("../models/promotion");
const AvisMagasin = require("../models/avis-magasin");
const AvisProduit = require("../models/avis-produit");
const MvtStock = require("../models/mvt-stock");

const toInt = (value, fallback) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const ensureYear = (year) => {
	const currentYear = new Date().getFullYear();
	const selectedYear = year ? Number(year) : currentYear;
	if (!Number.isInteger(selectedYear) || selectedYear < 1900 || selectedYear > 9999) {
		throw new Error("annee invalide");
	}
	return selectedYear;
};

const ensureDays = (days) => {
	const d = days === undefined ? 30 : toInt(days, 30);
	if (!Number.isInteger(d) || d < 1 || d > 365) {
		throw new Error("days invalide");
	}
	return d;
};

const pickMagasin = async ({ userId, magasinId }) => {
	const magasins = await Magasin.find({ appUser: userId }).select("nomMagasin appUser").lean();
	if (!magasins.length) {
		throw new Error("Aucune boutique trouvée pour cet utilisateur");
	}

	if (!magasinId) {
		return magasins[0];
	}

	const found = magasins.find((m) => String(m._id) === String(magasinId));
	if (!found) {
		throw new Error("Accès magasin refusé ou magasin non trouvé");
	}

	return found;
};

const getMonthlyRevenue = async ({ magasinId, year }) => {
	const start = new Date(year, 0, 1, 0, 0, 0, 0);
	const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);

	const agg = await Vente.aggregate([
		{ $match: { magasin: new mongoose.Types.ObjectId(magasinId), dateVente: { $gte: start, $lt: end } } },
		{
			$group: {
				_id: { $month: "$dateVente" },
				revenue: { $sum: { $ifNull: ["$totalPrix", 0] } },
				nombreVentes: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	const monthly = Array.from({ length: 12 }, () => ({ revenue: 0, nombreVentes: 0 }));
	for (const row of agg) {
		const monthIndex = Number(row._id) - 1;
		if (monthIndex >= 0 && monthIndex < 12) {
			monthly[monthIndex] = {
				revenue: Number(row.revenue) || 0,
				nombreVentes: Number(row.nombreVentes) || 0
			};
		}
	}

	return monthly;
};

const getStockAlerts = async ({ magasinId, limit = 5 }) => {
	const produits = await Produit.find({ magasin: magasinId })
		.select("nomProduit seuilNotification photos")
		.lean();

	if (!produits.length) {
		return { count: 0, produits: [] };
	}

	const produitIds = produits.map((p) => p._id);

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

	const stockMap = new Map(stockAgg.map((s) => [String(s._id), (s.totalEntree || 0) - (s.totalSortie || 0)]));

	const enriched = produits.map((p) => {
		const stockActuel = stockMap.get(String(p._id)) || 0;
		return {
			produitId: p._id,
			nomProduit: p.nomProduit,
			photos: Array.isArray(p.photos) ? p.photos : [],
			seuilNotification: p.seuilNotification ?? null,
			stockActuel
		};
	});

	const alertes = enriched.filter((p) => {
		if (p.stockActuel <= 0) return true;
		if (typeof p.seuilNotification === "number" && p.seuilNotification >= 0) {
			return p.stockActuel <= p.seuilNotification;
		}
		return false;
	});

	alertes.sort((a, b) => a.stockActuel - b.stockActuel);

	return {
		count: alertes.length,
		produits: alertes.slice(0, Math.max(0, limit))
	};
};

const getTopProduitsByVentes = async ({ magasinId, startDate, endDate, limit = 5 }) => {
	const agg = await VenteDetail.aggregate([
		{
			$lookup: {
				from: "ventes",
				localField: "vente",
				foreignField: "_id",
				as: "venteDoc"
			}
		},
		{ $unwind: "$venteDoc" },
		{
			$match: {
				"venteDoc.magasin": new mongoose.Types.ObjectId(magasinId),
				"venteDoc.dateVente": { $gte: startDate, $lte: endDate }
			}
		},
		{
			$group: {
				_id: "$produit",
				qteVendue: { $sum: { $ifNull: ["$qte", 0] } },
				revenue: { $sum: { $ifNull: ["$prixTotal", 0] } }
			}
		},
		{ $sort: { qteVendue: -1 } },
		{ $limit: Math.max(1, limit) },
		{
			$lookup: {
				from: "produits",
				localField: "_id",
				foreignField: "_id",
				as: "produitDoc"
			}
		},
		{ $unwind: { path: "$produitDoc", preserveNullAndEmptyArrays: true } },
		{
			$project: {
				produitId: "$_id",
				nomProduit: "$produitDoc.nomProduit",
				photos: "$produitDoc.photos",
				qteVendue: 1,
				revenue: 1
			}
		}
	]);

	return agg.map((row) => ({
		produitId: row.produitId,
		nomProduit: row.nomProduit || "(Produit supprimé)",
		photos: Array.isArray(row.photos) ? row.photos : [],
		qteVendue: Number(row.qteVendue) || 0,
		revenue: Number(row.revenue) || 0
	}));
};

const getTopProduitsByAvis = async ({ magasinId, limit = 5 }) => {
	const produits = await Produit.find({ magasin: magasinId })
		.select("nomProduit photos")
		.lean();

	if (!produits.length) {
		return [];
	}

	const produitIds = produits.map((p) => p._id);

	const avisAgg = await AvisProduit.aggregate([
		{ $match: { produit: { $in: produitIds } } },
		{
			$group: {
				_id: "$produit",
				avisMoyen: { $avg: "$nombreEtoile" },
				nombreAvis: { $sum: 1 }
			}
		},
		{ $match: { nombreAvis: { $gte: 1 } } },
		{ $sort: { avisMoyen: -1, nombreAvis: -1 } },
		{ $limit: Math.max(1, limit) }
	]);

	const produitMap = new Map(produits.map((p) => [String(p._id), p]));

	return avisAgg.map((row) => {
		const prod = produitMap.get(String(row._id));
		return {
			produitId: row._id,
			nomProduit: prod?.nomProduit || "(Produit supprimé)",
			photos: Array.isArray(prod?.photos) ? prod.photos : [],
			avisMoyen: Number((Number(row.avisMoyen) || 0).toFixed(2)),
			nombreAvis: Number(row.nombreAvis) || 0
		};
	});
};

const getPromotionsDetails = async ({ magasinId }) => {
	const now = new Date();
	const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

	const [promotionsActives, promotionsExpirentBientot] = await Promise.all([
		Promotion.find({
			magasin: magasinId,
			dateDebut: { $lte: now },
			dateFin: { $gte: now }
		})
			.populate("produit", "nomProduit photos")
			.select("pourcentage qte dateDebut dateFin produit")
			.sort({ dateFin: 1 })
			.limit(10)
			.lean(),
		Promotion.find({
			magasin: magasinId,
			dateFin: { $gte: now, $lte: in7Days }
		})
			.populate("produit", "nomProduit photos")
			.select("pourcentage qte dateDebut dateFin produit")
			.sort({ dateFin: 1 })
			.limit(10)
			.lean()
	]);

	const formatPromo = (p) => ({
		promotionId: p._id,
		pourcentage: Number(p.pourcentage) || 0,
		qte: Number(p.qte) || -1,
		dateDebut: p.dateDebut,
		dateFin: p.dateFin,
		produit: p.produit
			? {
					produitId: p.produit._id,
					nomProduit: p.produit.nomProduit || "(Sans nom)",
					photos: Array.isArray(p.produit.photos) ? p.produit.photos : []
			  }
			: null
	});

	return {
		promotionsActives: promotionsActives.map(formatPromo),
		promotionsExpirentBientot: promotionsExpirentBientot.map(formatPromo)
	};
};

const getBoutiqueDashboard = async ({ userId, magasinId, year, days }) => {
	if (!userId) throw new Error("userId est obligatoire");

	const selectedYear = ensureYear(year);
	const recentDays = ensureDays(days);

	const magasin = await pickMagasin({ userId, magasinId });

	const now = new Date();
	const recentStart = new Date(now.getTime() - recentDays * 24 * 60 * 60 * 1000);

	const [
		produitsCount,
		ventesRecentAgg,
		clientsUniquesRecent,
		avisMagasinAgg,
		promotionsActives,
		promotionsExpirentBientot
	] = await Promise.all([
		Produit.countDocuments({ magasin: magasin._id }),
		Vente.aggregate([
			{
				$match: {
					magasin: new mongoose.Types.ObjectId(magasin._id),
					dateVente: { $gte: recentStart, $lte: now }
				}
			},
			{
				$group: {
					_id: null,
					nombreVentes: { $sum: 1 },
					revenue: { $sum: { $ifNull: ["$totalPrix", 0] } }
				}
			}
		]),
		Vente.distinct("appUser", {
			magasin: magasin._id,
			dateVente: { $gte: recentStart, $lte: now }
		}).then((ids) => ids.length),
		AvisMagasin.aggregate([
			{ $match: { magasin: new mongoose.Types.ObjectId(magasin._id) } },
			{
				$group: {
					_id: "$magasin",
					avisMoyen: { $avg: "$nombreEtoile" },
					nombreAvis: { $sum: 1 }
				}
			}
		]),
		Promotion.countDocuments({
			magasin: magasin._id,
			dateDebut: { $lte: now },
			dateFin: { $gte: now }
		}),
		Promotion.countDocuments({
			magasin: magasin._id,
			dateFin: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
		})
	]);

	const ventesRecent = ventesRecentAgg?.[0] || { nombreVentes: 0, revenue: 0 };
	const avisMagasin = avisMagasinAgg?.[0] || { avisMoyen: 0, nombreAvis: 0 };

	const [monthly, stockAlerts, topProduitsByVentes, topProduitsByAvis, promotionsDetails] = await Promise.all([
		getMonthlyRevenue({ magasinId: magasin._id, year: selectedYear }),
		getStockAlerts({ magasinId: magasin._id, limit: 5 }),
		getTopProduitsByVentes({ magasinId: magasin._id, startDate: recentStart, endDate: now, limit: 5 }),
		getTopProduitsByAvis({ magasinId: magasin._id, limit: 5 }),
		getPromotionsDetails({ magasinId: magasin._id })
	]);

	return {
		generatedAt: now.toISOString(),
		annee: selectedYear,
		recentDays,
		magasin: {
			magasinId: magasin._id,
			nomMagasin: magasin.nomMagasin
		},
		summary: {
			produitsCount: Number(produitsCount) || 0,
			promotionsActives: Number(promotionsActives) || 0,
			promotionsExpirentBientot: Number(promotionsExpirentBientot) || 0,
			ventesRecent: {
				nombreVentes: Number(ventesRecent.nombreVentes) || 0,
				revenue: Number(ventesRecent.revenue) || 0,
				clientsUniques: Number(clientsUniquesRecent) || 0
			},
			avisMagasin: {
				avisMoyen: Number((Number(avisMagasin.avisMoyen) || 0).toFixed(2)),
				nombreAvis: Number(avisMagasin.nombreAvis) || 0
			}
		},
		monthly,
		stockAlerts,
		topProduitsByVentes,
		topProduitsByAvis,
		promotionsDetails
	};
};

module.exports = {
	getBoutiqueDashboard
};
