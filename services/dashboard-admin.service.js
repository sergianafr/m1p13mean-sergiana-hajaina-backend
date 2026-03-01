const Magasin = require("../models/magasin");
const Vente = require("../models/vente");
const AvisMagasin = require("../models/avis-magasin");

const getDashboardAdminData = async (year) => {
	const currentYear = new Date().getFullYear();
	const selectedYear = year ? Number(year) : currentYear;

	if (!Number.isInteger(selectedYear) || selectedYear < 1900 || selectedYear > 9999) {
		throw new Error("annee invalide");
	}

	const startDate = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
	const endDate = new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0);

	const [magasins, ventesByMagasin, avisByMagasin] = await Promise.all([
		Magasin.find().select("nomMagasin").lean(),
		Vente.aggregate([
			{ $match: { dateVente: { $gte: startDate, $lt: endDate } } },
			{
				$group: {
					_id: "$magasin",
					nombreVentes: { $sum: 1 }
				}
			}
		]),
		AvisMagasin.aggregate([
			{ $match: { dateAjout: { $gte: startDate, $lt: endDate } } },
			{
				$group: {
					_id: "$magasin",
					avisMoyen: { $avg: "$nombreEtoile" },
					nombreAvis: { $sum: 1 }
				}
			}
		])
	]);

	const venteMap = new Map(
		ventesByMagasin.map((item) => [String(item._id), Number(item.nombreVentes) || 0])
	);

	const avisMap = new Map(
		avisByMagasin.map((item) => [
			String(item._id),
			{
				avisMoyen: Number(item.avisMoyen?.toFixed(2)) || 0,
				nombreAvis: Number(item.nombreAvis) || 0
			}
		])
	);

	const data = magasins.map((magasin) => {
		const statsAvis = avisMap.get(String(magasin._id)) || { avisMoyen: 0, nombreAvis: 0 };

		return {
			magasinId: magasin._id,
			nomMagasin: magasin.nomMagasin,
			avisMoyen: statsAvis.avisMoyen,
			nombreAvis: statsAvis.nombreAvis,
			nombreVentes: venteMap.get(String(magasin._id)) || 0
		};
	});

	return {
		annee: selectedYear,
		data
	};
};

module.exports = {
	getDashboardAdminData
};
