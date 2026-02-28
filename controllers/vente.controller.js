const venteService = require("../services/vente.service");

exports.achat = async (req, res) => {
	try {
		const appUser = req.user?.id;
		const ventes = await venteService.createAchat(req.body?.details || req.body || [], appUser);
		res.status(201).json({ message: "Achat cree", ventes });
	} catch (error) {
		const status =
			error.message.includes("obligatoire") ||
			error.message.includes("existant") ||
			error.message.includes("insuffisant")
				? 400
				: error.message.includes("non trouve")
					? 404
					: 500;
		res.status(status).json({ message: error.message });
	}
};
