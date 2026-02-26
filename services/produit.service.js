const Produit = require("../models/produit");
const cloudinary = require("cloudinary").v2;

cloudinary.config({ secure: true });

const uploadSingleFileToCloudinary = async (file) => {
	if (!process.env.CLOUDINARY_URL) {
		throw new Error("CLOUDINARY_URL manquant");
	}

	const mimeType = file.mimetype || "application/octet-stream";
	const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

	const result = await cloudinary.uploader.upload(dataUri, {
		folder: "produits",
		resource_type: "image",
		use_filename: true,
		unique_filename: true
	});

	const imageUrl = result?.secure_url || result?.url;
	if (!imageUrl) {
		throw new Error("Aucune URL image retournée par Cloudinary");
	}

	return {
		url: imageUrl,
		dateAjout: new Date()
	};
};

const uploadPhotosToCloudinary = async (files = []) => {
	if (!files.length) {
		return [];
	}

	return Promise.all(files.map((file) => uploadSingleFileToCloudinary(file)));
};

const createProduit = async (dto, files = []) => {
	const {
		nomProduit,
		descriptionProduit,
		seuilNotification,
		unite,
		typeProduit,
		magasin
	} = dto;

	if (!nomProduit || !unite || !typeProduit || !magasin) {
		throw new Error("nomProduit, unite, typeProduit et magasin sont obligatoires");
	}

	const existing = await Produit.findOne({ nomProduit }).lean();
	if (existing) {
		throw new Error("Produit déjà existant");
	}

	const photos = await uploadPhotosToCloudinary(files);

	const produit = await Produit.create({
		nomProduit,
		descriptionProduit,
		seuilNotification,
		unite,
		typeProduit,
		magasin,
		photos
	});

	return produit;
};

module.exports = {
	createProduit
};
