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
		const status =
			error.message.includes("obligatoires") || error.message.includes("doit etre")
				? 400
				: 500;
		res.status(status).json({ message: error.message });
	}
};

