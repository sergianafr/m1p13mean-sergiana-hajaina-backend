
const Unite = require("../models/unite");

// CREATE
exports.save = async (req, res) => {
	try {
		const { nomUnite } = req.body;
		const existingUnite = await Unite.findOne({ nomUnite });
		if (existingUnite) {
			return res.status(400).json({ message: "Unité déjà existante" });
		}
		const unite = await Unite.create({ nomUnite });
		res.status(201).json({
			message: "Unité créée",
			unite: {
				id: unite._id,
				nomUnite: unite.nomUnite
			}
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ALL
exports.getAll = async (req, res) => {
	try {
		const unites = await Unite.find();
		res.status(200).json(unites);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ONE
exports.getById = async (req, res) => {
	try {
		const { id } = req.params;
		const unite = await Unite.findById(id);
		if (!unite) {
			return res.status(404).json({ message: "Unité non trouvée" });
		}
		res.status(200).json(unite);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// UPDATE
exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const { nomUnite } = req.body;
		const updatedUnite = await Unite.findByIdAndUpdate(
			id,
			{ nomUnite },
			{ new: true, runValidators: true }
		);
		if (!updatedUnite) {
			return res.status(404).json({ message: "Unité non trouvée" });
		}
		res.status(200).json({
			message: "Unité mise à jour",
			unite: updatedUnite
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// DELETE
exports.remove = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedUnite = await Unite.findByIdAndDelete(id);
		if (!deletedUnite) {
			return res.status(404).json({ message: "Unité non trouvée" });
		}
		res.status(200).json({ message: "Unité supprimée" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
