const avisMagasinService = require("../services/avis-magasin.service");

exports.add = async (req, res) => {
	try {
		const appUser = req.user?.id;
		const avisMagasin = await avisMagasinService.ajouterAvisMagasin({
			...req.body,
			appUser
		});

		res.status(201).json({ message: "Avis magasin ajoute", avisMagasin });
	} catch (error) {
		const status =
			error.message.includes("obligatoires") || error.message.includes("doit etre")
				? 400
				: 500;
		res.status(status).json({ message: error.message });
	}
};
