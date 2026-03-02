const avisProduitService = require("../services/avis-produit.service");

exports.add = async (req, res) => {
	try {
		const appUser = req.user?.id;
		const avisProduit = await avisProduitService.ajouterAvisProduit({
			...req.body,
			appUser
		});

		res.status(201).json({ message: "Avis produit ajoute", avisProduit });
	} catch (error) {
		console.log(error);
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

		// Vérifier que c'est bien l'auteur de l'avis
		const avisExistant = await require("../models/avis-produit").findById(id);
		if (!avisExistant) {
			return res.status(404).json({ message: "Avis non trouve" });
		}

		if (String(avisExistant.appUser) !== String(userId)) {
			return res.status(403).json({ message: "Vous n'etes pas autorise a modifier cet avis" });
		}

		const avisProduit = await avisProduitService.modifierAvisProduit(id, req.body);
		res.status(200).json({ message: "Avis produit modifie", avisProduit });
	} catch (error) {
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

		const result = await avisProduitService.supprimerAvisProduit(id, userId);
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

