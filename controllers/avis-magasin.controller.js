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

exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		const avisExistant = await require("../models/avis-magasin").findById(id);
		if (!avisExistant) {
			return res.status(404).json({ message: "Avis non trouve" });
		}

		if (String(avisExistant.appUser) !== String(userId)) {
			return res.status(403).json({ message: "Vous n'etes pas autorise a modifier cet avis" });
		}

		const avisMagasin = await avisMagasinService.modifierAvisMagasin(id, req.body);
		res.status(200).json({ message: "Avis magasin modifie", avisMagasin });
	} catch (error) {
		console.log(error);
		const status =
			error.message.includes("obligatoire") || error.message.includes("doit etre")
				? 400
				: error.message.includes("non trouve")
				? 404
				: 500;
		res.status(status).json({ message: error.message });
	}
};

exports.remove = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		const result = await avisMagasinService.supprimerAvisMagasin(id, userId);
		res.status(200).json(result);
	} catch (error) {
		const status =
			error.message.includes("obligatoire")
				? 400
				: error.message.includes("non trouve")
				? 404
				: error.message.includes("autorise")
				? 403
				: 500;
		res.status(status).json({ message: error.message });
	}
};
