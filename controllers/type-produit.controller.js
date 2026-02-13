
const TypeProduit = require("../models/type-produit");

// CREATE
exports.save = async (req, res) => {
	try {
		const { nomTypeProduit } = req.body;
		const existingType = await TypeProduit.findOne({ nomTypeProduit });
		if (existingType) {
			return res.status(400).json({ message: "Type déjà existant" });
		}
		const typeProduit = await TypeProduit.create({ nomTypeProduit });
		res.status(201).json({
			message: "Type de produit créé",
			typeProduit: {
				id: typeProduit._id,
				nomTypeProduit: typeProduit.nomTypeProduit
			}
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ALL
exports.getAll = async (req, res) => {
	try {
		const types = await TypeProduit.find();
		res.status(200).json(types);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ONE
exports.getById = async (req, res) => {
	try {
		const { id } = req.params;
		const type = await TypeProduit.findById(id);
		if (!type) {
			return res.status(404).json({ message: "Type de produit non trouvé" });
		}
		res.status(200).json(type);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// UPDATE
exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const { nomTypeProduit } = req.body;
		const updatedType = await TypeProduit.findByIdAndUpdate(
			id,
			{ nomTypeProduit },
			{ new: true, runValidators: true }
		);
		if (!updatedType) {
			return res.status(404).json({ message: "Type de produit non trouvé" });
		}
		res.status(200).json({
			message: "Type de produit mis à jour",
			typeProduit: updatedType
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// DELETE
exports.remove = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedType = await TypeProduit.findByIdAndDelete(id);
		if (!deletedType) {
			return res.status(404).json({ message: "Type de produit non trouvé" });
		}
		res.status(200).json({ message: "Type de produit supprimé" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
