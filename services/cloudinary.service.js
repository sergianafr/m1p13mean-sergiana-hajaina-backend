const cloudinary = require("cloudinary").v2;

cloudinary.config({ secure: true });

const deleteImageFromCloudinary = async ({ imageUrl, publicId } = {}) => {
	const resolvedPublicId = process.env.CLOUDINARY_PUBLIC_ID;

	if (!resolvedPublicId) {
		throw new Error("Impossible de déterminer le publicId Cloudinary");
	}

	const result = await cloudinary.uploader.destroy(resolvedPublicId, {
		resource_type: "image"
	});

	if (result?.result !== "ok" && result?.result !== "not found") {
		throw new Error("Échec suppression Cloudinary");
	}

	return {
		success: result?.result === "ok",
		result: result?.result,
		publicId: resolvedPublicId
	};
};

const uploadSingleFileToCloudinary = async (file, folder, resource_type) => {
	if (!process.env.CLOUDINARY_URL) {
		throw new Error("CLOUDINARY_URL manquant");
	}

	const mimeType = file.mimetype || "application/octet-stream";
	const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

	const result = await cloudinary.uploader.upload(dataUri, {
		folder: folder,
		resource_type: resource_type,
		use_filename: true,
		unique_filename: true
	});

	const fileUrl = result?.secure_url || result?.url;
	if (!fileUrl) {
		throw new Error("Aucune URL image retournée par Cloudinary");
	}

	return {
		url: fileUrl,
		dateAjout: new Date()
	};
};


const deleteImageFromCloudinaryByUrl = async (imageUrl) =>
	deleteImageFromCloudinary({ imageUrl });

module.exports = {
	deleteImageFromCloudinary,
	deleteImageFromCloudinaryByUrl,
	uploadSingleFileToCloudinary
};
