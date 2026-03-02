const toNumber = (value) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
};

const buildActivePromotionFilters = (date = new Date()) => {
	return {
		dateDebut: { $lte: date },
		dateFin: { $gte: date },
		$or: [{ qte: { $gt: 0 } }, { qte: { $lt: 0 } }]
	};
};

const toPromotionInfo = (promoDoc) => {
	if (!promoDoc) return null;

	return {
		_id: promoDoc._id,
		pourcentage: toNumber(promoDoc.pourcentage),
		dateDebut: promoDoc.dateDebut,
		dateFin: promoDoc.dateFin,
		qte: promoDoc.qte
	};
};

const pickBestPromotion = (a, b) => {
	if (!a && !b) return null;
	if (!a) return b;
	if (!b) return a;

	const pa = toNumber(a.pourcentage);
	const pb = toNumber(b.pourcentage);

	if (pa > pb) return a;
	if (pb > pa) return b;

	const da = a.dateDebut ? new Date(a.dateDebut).getTime() : 0;
	const db = b.dateDebut ? new Date(b.dateDebut).getTime() : 0;

	return db > da ? b : a;
};

module.exports = {
	buildActivePromotionFilters,
	toPromotionInfo,
	pickBestPromotion
};
