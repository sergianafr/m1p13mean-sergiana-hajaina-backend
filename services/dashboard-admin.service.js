const Magasin = require("../models/magasin");
const Vente = require("../models/vente");
const AvisMagasin = require("../models/avis-magasin");
const Promotion = require("../models/promotion");
const User = require("../models/user");

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

const getDashboardAdminData = async (year) => {
	const currentYear = new Date().getFullYear();
	const selectedYear = year ? Number(year) : currentYear;

	if (!Number.isInteger(selectedYear) || selectedYear < 1900 || selectedYear > 9999) {
		throw new Error("annee invalide");
	}

	const startDate = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
	const endDate = new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0);

	const [magasins, ventesByMagasin, avisByMagasin] = await Promise.all([
		Magasin.find().select("nomMagasin").lean(),
		Vente.aggregate([
			{ $match: { dateVente: { $gte: startDate, $lt: endDate } } },
			{
				$group: {
					_id: "$magasin",
					nombreVentes: { $sum: 1 }
				}
			}
		]),
		AvisMagasin.aggregate([
			{ $match: { dateAjout: { $gte: startDate, $lt: endDate } } },
			{
				$group: {
					_id: "$magasin",
					avisMoyen: { $avg: "$nombreEtoile" },
					nombreAvis: { $sum: 1 }
				}
			}
		])
	]);

	const venteMap = new Map(
		ventesByMagasin.map((item) => [String(item._id), Number(item.nombreVentes) || 0])
	);

	const avisMap = new Map(
		avisByMagasin.map((item) => [
			String(item._id),
			{
				avisMoyen: Number(item.avisMoyen?.toFixed(2)) || 0,
				nombreAvis: Number(item.nombreAvis) || 0
			}
		])
	);

	const data = magasins.map((magasin) => {
		const statsAvis = avisMap.get(String(magasin._id)) || { avisMoyen: 0, nombreAvis: 0 };

		return {
			magasinId: magasin._id,
			nomMagasin: magasin.nomMagasin,
			avisMoyen: statsAvis.avisMoyen,
			nombreAvis: statsAvis.nombreAvis,
			nombreVentes: venteMap.get(String(magasin._id)) || 0
		};
	});

	return {
		annee: selectedYear,
		data
	};
};

const getAdminDashboard = async ({ year, days } = {}) => {
	const selectedYear = ensureYear(year);
	const recentDays = ensureDays(days);

	const startYear = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
	const endYear = new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0);

	const now = new Date();
	const recentStart = new Date(now.getTime() - recentDays * 24 * 60 * 60 * 1000);

	const [
		magasins,
		usersTotal,
		usersAdmins,
		usersBoutiques,
		usersClients,
		promotionsActives,
		promotionsExpirentBientot,
		recentAgg,
		recentClientsUniques,
		aggYearByMagasin,
		aggAvisByMagasin,
		aggMonthlyRevenue,
		aggTopMagasinsRecent
	] = await Promise.all([
		Magasin.find().select("nomMagasin").lean(),
		User.countDocuments(),
		User.countDocuments({ role: "ADMIN" }),
		User.countDocuments({ role: "BOUTIQUE" }),
		User.countDocuments({ role: "CLIENT" }),
		Promotion.countDocuments({ dateDebut: { $lte: now }, dateFin: { $gte: now } }),
		Promotion.countDocuments({
			dateFin: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
		}),
		Vente.aggregate([
			{ $match: { dateVente: { $gte: recentStart, $lte: now } } },
			{
				$group: {
					_id: null,
					nombreVentes: { $sum: 1 },
					revenue: { $sum: { $ifNull: ["$totalPrix", 0] } }
				}
			}
		]),
		Vente.distinct("appUser", { dateVente: { $gte: recentStart, $lte: now } }).then((ids) => ids.length),
		Vente.aggregate([
			{ $match: { dateVente: { $gte: startYear, $lt: endYear } } },
			{
				$group: {
					_id: "$magasin",
					nombreVentes: { $sum: 1 },
					revenue: { $sum: { $ifNull: ["$totalPrix", 0] } }
				}
			}
		]),
		AvisMagasin.aggregate([
			{ $match: { createdAt: { $gte: startYear, $lt: endYear } } },
			{
				$group: {
					_id: "$magasin",
					avisMoyen: { $avg: "$nombreEtoile" },
					nombreAvis: { $sum: 1 }
				}
			}
		]),
		Vente.aggregate([
			{ $match: { dateVente: { $gte: startYear, $lt: endYear } } },
			{
				$group: {
					_id: { $month: "$dateVente" },
					revenue: { $sum: { $ifNull: ["$totalPrix", 0] } },
					nombreVentes: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		]),
		Vente.aggregate([
			{ $match: { dateVente: { $gte: recentStart, $lte: now } } },
			{
				$group: {
					_id: "$magasin",
					nombreVentes: { $sum: 1 },
					revenue: { $sum: { $ifNull: ["$totalPrix", 0] } }
				}
			},
			{ $sort: { revenue: -1 } },
			{ $limit: 5 },
			{
				$lookup: {
					from: "magasins",
					localField: "_id",
					foreignField: "_id",
					as: "magasinDoc"
				}
			},
			{ $unwind: { path: "$magasinDoc", preserveNullAndEmptyArrays: true } },
			{
				$project: {
					magasinId: "$_id",
					nomMagasin: "$magasinDoc.nomMagasin",
					nombreVentes: 1,
					revenue: 1
				}
			}
		])
	]);

	const recent = recentAgg?.[0] || { nombreVentes: 0, revenue: 0 };

	const ventesMap = new Map(
		aggYearByMagasin.map((item) => [String(item._id), { nombreVentes: item.nombreVentes, revenue: item.revenue }])
	);

	const avisMap = new Map(
		aggAvisByMagasin.map((item) => [
			String(item._id),
			{
				avisMoyen: Number((Number(item.avisMoyen) || 0).toFixed(2)),
				nombreAvis: Number(item.nombreAvis) || 0
			}
		])
	);

	const magasinsStats = magasins.map((magasin) => {
		const venteStats = ventesMap.get(String(magasin._id)) || { nombreVentes: 0, revenue: 0 };
		const avisStats = avisMap.get(String(magasin._id)) || { avisMoyen: 0, nombreAvis: 0 };
		return {
			magasinId: magasin._id,
			nomMagasin: magasin.nomMagasin,
			nombreVentes: Number(venteStats.nombreVentes) || 0,
			revenue: Number(venteStats.revenue) || 0,
			avisMoyen: avisStats.avisMoyen,
			nombreAvis: avisStats.nombreAvis
		};
	});

	const monthly = Array.from({ length: 12 }, () => ({ revenue: 0, nombreVentes: 0 }));
	for (const row of aggMonthlyRevenue) {
		const idx = Number(row._id) - 1;
		if (idx >= 0 && idx < 12) {
			monthly[idx] = {
				revenue: Number(row.revenue) || 0,
				nombreVentes: Number(row.nombreVentes) || 0
			};
		}
	}

	return {
		generatedAt: now.toISOString(),
		annee: selectedYear,
		recentDays,
		summary: {
			magasinsCount: magasins.length,
			users: {
				total: Number(usersTotal) || 0,
				admins: Number(usersAdmins) || 0,
				boutiques: Number(usersBoutiques) || 0,
				clients: Number(usersClients) || 0
			},
			ventesRecent: {
				nombreVentes: Number(recent.nombreVentes) || 0,
				revenue: Number(recent.revenue) || 0,
				clientsUniques: Number(recentClientsUniques) || 0
			},
			promotions: {
				actives: Number(promotionsActives) || 0,
				expirentBientot: Number(promotionsExpirentBientot) || 0
			}
		},
		monthly,
		magasins: magasinsStats,
		topMagasinsRecent: (aggTopMagasinsRecent || []).map((row) => ({
			magasinId: row.magasinId,
			nomMagasin: row.nomMagasin || "(Magasin supprimé)",
			nombreVentes: Number(row.nombreVentes) || 0,
			revenue: Number(row.revenue) || 0
		}))
	};
};

module.exports = {
	getDashboardAdminData,
	getAdminDashboard
};
