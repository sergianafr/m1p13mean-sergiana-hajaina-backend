const favorisService = require("../services/favoris.service");

exports.getByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const favoris = await favorisService.getFavorisByUser(userId);
		res.status(200).json(favoris);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.add = async (req, res) => {
	try {
		const favoris = await favorisService.ajouterFavori(req.body);
		res.status(201).json({ message: "Favori ajoute", favoris });
	} catch (error) {
		const status = error.message.includes("obligatoires") || error.message.includes("existant")
			? 400
			: 500;
		res.status(status).json({ message: error.message });
	}
};

exports.remove = async (req, res) => {
	try {
		const favoris = await favorisService.supprimerFavori(req.body);
		res.status(200).json({ message: "Favori supprime", favoris });
	} catch (error) {
		const status = error.message.includes("obligatoires")
			? 400
			: error.message === "Favori non trouve"
				? 404
				: 500;
		res.status(status).json({ message: error.message });
	}
};
