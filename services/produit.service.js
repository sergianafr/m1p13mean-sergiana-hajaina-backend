const Produit = require("../models/produit");
const PrixProduit = require("../models/prix-produit");
const cloudinary = require("cloudinary").v2;
const { deleteImageFromCloudinaryByUrl, uploadSingleFileToCloudinary } = require("./cloudinary.service");

cloudinary.config({ secure: true });

const uploadPhotosToCloudinary = async (files = []) => {
	if (!files.length) {
		return [];
	}

	return Promise.all(files.map((file) => uploadSingleFileToCloudinary(file, "produits", "image")));
};

const createProduit = async (dto, files = []) => {
	const {
		nomProduit,
		descriptionProduit,
		seuilNotification,
		unite,
		typeProduit,
		magasin,
		prixUnitaire
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

	// Créer le prix initial si fourni
	if (prixUnitaire && parseFloat(prixUnitaire) > 0) {
		await PrixProduit.create({
			prixUnitaire: parseFloat(prixUnitaire),
			dateDebut: new Date(),
			dateFin: null,
			produit: produit._id
		});
	}

	return produit;
};

const updateProduit = async (produitId, dto, files = []) => {
	if (!produitId) {
		throw new Error("produitId est obligatoire");
	}

	const produit = await Produit.findById(produitId);
	if (!produit) {
		throw new Error("Produit non trouvé");
	}

	const { nomProduit, descriptionProduit, seuilNotification, unite, typeProduit, magasin } = dto;

	if (nomProduit) produit.nomProduit = nomProduit;
	if (descriptionProduit !== undefined) produit.descriptionProduit = descriptionProduit;
	if (seuilNotification !== undefined) produit.seuilNotification = seuilNotification;
	if (unite) produit.unite = unite;
	if (typeProduit) produit.typeProduit = typeProduit;
	if (magasin) produit.magasin = magasin;

	if (files && files.length > 0) {
		const newPhotos = await uploadPhotosToCloudinary(files);
		produit.photos = [...(produit.photos || []), ...newPhotos];
	}

	await produit.save();
	return produit;
};

const deleteProduitPhotoByUrl = async (produitId, imageUrl) => {
	if (!produitId || !imageUrl) {
		throw new Error("produitId et imageUrl sont obligatoires");
	}

	const produit = await Produit.findById(produitId);
	if (!produit) {
		throw new Error("Produit non trouvé");
	}

	const hasPhoto = produit.photos?.some((photo) => photo?.url === imageUrl);
	if (!hasPhoto) {
		throw new Error("Photo non trouvée pour ce produit");
	}

	await deleteImageFromCloudinaryByUrl(imageUrl);

	produit.photos = (produit.photos || []).filter((photo) => photo?.url !== imageUrl);
	await produit.save();

	return produit;
};


module.exports = {
	createProduit,
	updateProduit,
	deleteProduitPhotoByUrl
};
