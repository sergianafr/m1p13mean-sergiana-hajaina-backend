const User = require("../models/user");

// CREATE
exports.save = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Utilisateur déjà existant" });
		}
		const user = await User.create({ name, email, password, role });
		res.status(201).json({
			message: "Utilisateur créé",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ALL
exports.getAll = async (req, res) => {
	try {
		const users = await User.find().select('-password');
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ BY ROLE
exports.getByRole = async (req, res) => {
	try {
		const { role } = req.params;
		const users = await User.find({ role: role.toUpperCase() }).select('-password');
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// READ ONE
exports.getById = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id).select('-password');
		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// UPDATE
exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, password, role } = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ name, email, password, role },
			{ new: true, runValidators: true }
		);
		if (!updatedUser) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}
		res.status(200).json({
			message: "Utilisateur mis à jour",
			user: updatedUser
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// DELETE
exports.remove = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedUser = await User.findByIdAndDelete(id);
		if (!deletedUser) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}
		res.status(200).json({ message: "Utilisateur supprimé" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
