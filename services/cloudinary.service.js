const cloudinary = require("cloudinary").v2;

cloudinary.config({ secure: true });

const extractPublicIdFromCloudinaryUrl = (imageUrl) => {
	if (!imageUrl || typeof imageUrl !== "string") {
		return null;
	}

	let parsedUrl;
	try {
		parsedUrl = new URL(imageUrl);
	} catch (error) {
		return null;
	}

	const segments = decodeURIComponent(parsedUrl.pathname)
		.split("/")
		.filter(Boolean);

	const uploadIndex = segments.findIndex((segment) => segment === "upload");
	if (uploadIndex === -1 || uploadIndex + 1 >= segments.length) {
		return null;
	}

	let publicIdParts = segments.slice(uploadIndex + 1);
	if (/^v\d+$/.test(publicIdParts[0])) {
		publicIdParts = publicIdParts.slice(1);
	}

	if (!publicIdParts.length) {
		return null;
	}

	const lastPart = publicIdParts.pop();
	const withoutExtension = lastPart.replace(/\.[^/.]+$/, "");

	return [...publicIdParts, withoutExtension].join("/");
};

const deleteImageFromCloudinary = async ({ imageUrl, publicId } = {}) => {
	const resolvedPublicId =
		publicId || extractPublicIdFromCloudinaryUrl(imageUrl) || process.env.CLOUDINARY_PUBLIC_ID;

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

const deleteImageFromCloudinaryByUrl = async (imageUrl) =>
	deleteImageFromCloudinary({ imageUrl });

module.exports = {
	deleteImageFromCloudinary,
	deleteImageFromCloudinaryByUrl,
	extractPublicIdFromCloudinaryUrl
};
