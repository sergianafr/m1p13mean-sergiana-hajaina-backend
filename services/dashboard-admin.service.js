const Magasin = require("../models/magasin");
const Vente = require("../models/vente");
const AvisMagasin = require("../models/avis-magasin");
const Promotion = require("../models/promotion");
const User = require("../models/user");
const LoyerBox = require("../models/loyer-box");
const MagasinBox = require("../models/magasin-box");
const Box = require("../models/box");

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
		boxesTotal,
		boxesOccupes
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
		Box.countDocuments(),
		MagasinBox.countDocuments({
			dateDebut: { $lte: now },
			$or: [{ dateFin: null }, { dateFin: { $gte: now } }]
		})
	]);

	const [aggLoyersYear, aggLoyersRecent, aggLoyersMonthly] = await Promise.all([
		LoyerBox.aggregate([
			{
				$match: {
					$or: [
						{ dateDebut: { $lt: endYear }, $or: [{ dateFin: null }, { dateFin: { $gte: startYear } }] }
					]
				}
			},
			{
				$lookup: {
					from: "magasinboxes",
					localField: "box",
					foreignField: "box",
					as: "magasinBoxes"
				}
			},
			{ $unwind: { path: "$magasinBoxes", preserveNullAndEmptyArrays: false } },
			{
				$match: {
					"magasinBoxes.dateDebut": { $lt: endYear },
					$or: [
						{ "magasinBoxes.dateFin": null },
						{ "magasinBoxes.dateFin": { $gte: startYear } }
					]
				}
			},
			{
				$group: {
					_id: "$magasinBoxes.magasin",
					totalLoyer: { $sum: "$montantLoyer" }
				}
			}
		]),
		LoyerBox.aggregate([
			{
				$match: {
					$or: [
						{ dateDebut: { $lt: now }, $or: [{ dateFin: null }, { dateFin: { $gte: recentStart } }] }
					]
				}
			},
			{
				$lookup: {
					from: "magasinboxes",
					localField: "box",
					foreignField: "box",
					as: "magasinBoxes"
				}
			},
			{ $unwind: { path: "$magasinBoxes", preserveNullAndEmptyArrays: false } },
			{
				$match: {
					"magasinBoxes.dateDebut": { $lt: now },
					$or: [
						{ "magasinBoxes.dateFin": null },
						{ "magasinBoxes.dateFin": { $gte: recentStart } }
					]
				}
			},
			{
				$group: {
					_id: null,
					totalLoyer: { $sum: "$montantLoyer" }
				}
			}
		]),
		LoyerBox.aggregate([
			{
				$match: {
					dateDebut: { $lt: endYear },
					$or: [{ dateFin: null }, { dateFin: { $gte: startYear } }]
				}
			},
			{
				$lookup: {
					from: "magasinboxes",
					localField: "box",
					foreignField: "box",
					as: "magasinBoxes"
				}
			},
			{ $unwind: { path: "$magasinBoxes", preserveNullAndEmptyArrays: false } },
			{
				$project: {
					magasin: "$magasinBoxes.magasin",
					montantLoyer: 1,
					dateDebut: 1,
					dateFin: 1,
					months: {
						$map: {
							input: { $range: [0, 12] },
							as: "monthIdx",
							in: {
								$let: {
									vars: {
										monthStart: {
											$dateFromParts: {
												year: selectedYear,
												month: { $add: ["$$monthIdx", 1] },
												day: 1
											}
										},
										monthEnd: {
											$dateFromParts: {
												year: selectedYear,
												month: { $add: ["$$monthIdx", 2] },
												day: 1
											}
										}
									},
									in: {
										$cond: {
											if: {
												$and: [
													{ $lt: ["$dateDebut", "$$monthEnd"] },
													{
														$or: [
															{ $eq: ["$dateFin", null] },
															{ $gte: ["$dateFin", "$$monthStart"] }
														]
													}
												]
											},
											then: "$montantLoyer",
											else: 0
										}
									}
								}
							}
						}
					}
				}
			},
			{ $unwind: { path: "$months", includeArrayIndex: "monthIdx" } },
			{
				$group: {
					_id: "$monthIdx",
					totalLoyer: { $sum: "$months" }
				}
			},
			{ $sort: { _id: 1 } }
		])
	]);

	const [aggAvisByMagasin, aggAvisMonthlyByMagasin] = await Promise.all([
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
		AvisMagasin.aggregate([
			{ $match: { createdAt: { $gte: startYear, $lt: endYear } } },
			{
				$group: {
					_id: {
						magasin: "$magasin",
						month: { $month: "$createdAt" }
					},
					avisMoyen: { $avg: "$nombreEtoile" },
					nombreAvis: { $sum: 1 }
				}
			}
		])
	]);

	const loyersYearMap = new Map(
		aggLoyersYear.map((item) => [String(item._id), Number(item.totalLoyer) || 0])
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

	const monthlyRevenue = Array.from({ length: 12 }, () => 0);
	for (const row of aggLoyersMonthly) {
		const idx = Number(row._id);
		if (idx >= 0 && idx < 12) {
			monthlyRevenue[idx] = Number(row.totalLoyer) || 0;
		}
	}

	const avisMonthlyMap = new Map();
	for (const row of aggAvisMonthlyByMagasin) {
		const magasinId = String(row._id.magasin);
		const month = Number(row._id.month) - 1;
		if (!avisMonthlyMap.has(magasinId)) {
			avisMonthlyMap.set(magasinId, Array.from({ length: 12 }, () => ({ avisMoyen: 0, nombreAvis: 0 })));
		}
		if (month >= 0 && month < 12) {
			avisMonthlyMap.get(magasinId)[month] = {
				avisMoyen: Number((Number(row.avisMoyen) || 0).toFixed(2)),
				nombreAvis: Number(row.nombreAvis) || 0
			};
		}
	}

	const magasinsStats = magasins.map((magasin) => {
		const magasinId = String(magasin._id);
		const avisStats = avisMap.get(magasinId) || { avisMoyen: 0, nombreAvis: 0 };
		const avisMonthly =
			avisMonthlyMap.get(magasinId) || Array.from({ length: 12 }, () => ({ avisMoyen: 0, nombreAvis: 0 }));

		return {
			magasinId: magasin._id,
			nomMagasin: magasin.nomMagasin,
			avisMoyen: avisStats.avisMoyen,
			nombreAvis: avisStats.nombreAvis,
			avisMonthly
		};
	});

	const magasinsAvis = [...magasinsStats]
		.sort((a, b) => b.avisMoyen - a.avisMoyen || b.nombreAvis - a.nombreAvis)
		.map((m) => ({
			magasinId: m.magasinId,
			nomMagasin: m.nomMagasin,
			avisMoyen: m.avisMoyen,
			nombreAvis: m.nombreAvis,
			avisMonthly: m.avisMonthly
		}));

	const totalRevenueYear = monthlyRevenue.reduce((sum, val) => sum + val, 0);
	const recentRevenue = (aggLoyersRecent?.[0]?.totalLoyer || 0) / recentDays * 30; // Normaliser sur 30j

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
			boxes: {
				total: Number(boxesTotal) || 0,
				occupes: Number(boxesOccupes) || 0,
				libres: Number(boxesTotal - boxesOccupes) || 0
			},
			loyersRecent: {
				revenue: Number(recentRevenue.toFixed(2)) || 0
			},
			promotions: {
				actives: Number(promotionsActives) || 0,
				expirentBientot: Number(promotionsExpirentBientot) || 0
			}
		},
		totalRevenueYear: Number(totalRevenueYear.toFixed(2)) || 0,
		magasinsAvis
	};
};

module.exports = {
	getAdminDashboard
};

