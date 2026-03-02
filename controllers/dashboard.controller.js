const dashboardAdminService = require("../services/dashboard-admin.service");
const dashboardBoutiqueService = require("../services/dashboard-boutique.service");

const toIntOrUndefined = (value) => {
	if (value === undefined || value === null || value === "") return undefined;
	const n = Number(value);
	return Number.isInteger(n) ? n : undefined;
};

exports.getAdminDashboard = async (req, res) => {
	try {
		const year = toIntOrUndefined(req.query.year);
		const days = toIntOrUndefined(req.query.days);

		const dashboard = await dashboardAdminService.getAdminDashboard({ year, days });
		res.status(200).json(dashboard);
	} catch (error) {
		const message = error?.message || "Erreur serveur";
		const status = message.includes("invalide") || message.includes("obligatoire") ? 400 : 500;
		res.status(status).json({ message });
	}
};

exports.getBoutiqueDashboard = async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ message: "Utilisateur non authentifié" });
		}

		const magasinId = typeof req.query.magasinId === "string" ? req.query.magasinId : undefined;
		const year = toIntOrUndefined(req.query.year);
		const days = toIntOrUndefined(req.query.days);

		const dashboard = await dashboardBoutiqueService.getBoutiqueDashboard({
			userId,
			magasinId,
			year,
			days
		});

		res.status(200).json(dashboard);
	} catch (error) {
		const message = error?.message || "Erreur serveur";
		const status =
			message.includes("invalide") ||
			message.includes("obligatoire") ||
			message.includes("non trouve") ||
			message.includes("Accès")
				? 400
				: 500;
		res.status(status).json({ message });
	}
};
