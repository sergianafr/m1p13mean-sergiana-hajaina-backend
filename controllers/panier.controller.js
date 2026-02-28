const panierService = require("../services/panier.service");

exports.add = async (req, res) => {
	try {
		const panier = await panierService.ajouterPanier(req.body);
		res.status(201).json({ message: "Panier ajoute", panier });
	} catch (error) {
		const status = error.message.includes("obligatoires") || error.message.includes("superieur")
			? 400
			: 500;
		res.status(status).json({ message: error.message });
	}
};

exports.remove = async (req, res) => {
	try {
		const panier = await panierService.supprimerPanier(req.body);
		res.status(200).json({ message: "Panier supprime", panier });
	} catch (error) {
		const status = error.message.includes("obligatoires")
			? 400
			: error.message === "Panier non trouve"
				? 404
				: 500;
		res.status(status).json({ message: error.message });
	}
};
