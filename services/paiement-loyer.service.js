const PaiementLoyer = require("../models/paiement-loyer");
const MagasinBox = require("../models/magasin-box");
const LoyerBox = require("../models/loyer-box");

function getMonthBoundaries(annee, mois) {
    const start = new Date(Date.UTC(annee, mois - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(annee, mois, 0, 23, 59, 59, 999));
    return { start, end };
}

function buildPeriodOverlapQuery(start, end) {
    return {
        dateDebut: { $lte: end },
        $or: [{ dateFin: null }, { dateFin: { $gte: start } }]
    };
}

function parsePositiveInteger(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

exports.createPaiement = async (payload) => {
    const { magasin, mois, annee, datePaiement } = payload;

    if (!magasin || !mois || !annee) {
        throw new Error("magasin, mois et annee sont obligatoires");
    }

    if (mois < 1 || mois > 12) {
        throw new Error("Le mois doit être compris entre 1 et 12");
    }

    const { start, end } = getMonthBoundaries(Number(annee), Number(mois));

    const associationsActives = await MagasinBox.find({
        magasin,
        ...buildPeriodOverlapQuery(start, end)
    }).lean();

    if (!associationsActives.length) {
        throw new Error("Aucune association active entre ce magasin et ses box pour ce mois");
    }

    const alreadyPaid = await PaiementLoyer.findOne({ magasin, mois, annee }).lean();
    if (alreadyPaid) {
        throw new Error("Le loyer de ce mois est déjà payé pour ce magasin");
    }

    const uniqueBoxIds = [...new Set(associationsActives.map((association) => String(association.box)))];

    const loyersParBox = await Promise.all(
        uniqueBoxIds.map(async (boxId) => {
            const loyerActif = await LoyerBox.findOne({
                box: boxId,
                ...buildPeriodOverlapQuery(start, end)
            })
                .sort({ dateDebut: -1 })
                .lean();

            return {
                boxId,
                loyerActif
            };
        })
    );

    const boxesSansLoyer = loyersParBox.filter((entry) => !entry.loyerActif).map((entry) => entry.boxId);
    if (boxesSansLoyer.length) {
        throw new Error("Certains box actifs n'ont pas de loyer actif sur la période demandée");
    }

    const details = loyersParBox.map((entry) => ({
        box: entry.boxId,
        loyerBox: entry.loyerActif._id,
        montantLoyer: entry.loyerActif.montantLoyer
    }));

    const montantPaye = details.reduce((sum, item) => sum + Number(item.montantLoyer || 0), 0);

    const paiement = await PaiementLoyer.create({
        magasin,
        mois,
        annee,
        datePaiement: datePaiement || new Date(),
        montantPaye,
        details
    });

    return PaiementLoyer.findById(paiement._id)
        .populate("magasin", "nomMagasin")
        .populate("details.box", "nomBox aireBox")
        .populate("details.loyerBox", "montantLoyer dateDebut dateFin")
        .lean();
};

exports.getAllPaiements = async (queryParams) => {
    const {
        magasin,
        box,
        mois,
        annee,
        page: pageParam,
        limit: limitParam
    } = queryParams;

    const page = parsePositiveInteger(pageParam) || 1;
    const limit = parsePositiveInteger(limitParam) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (magasin) query.magasin = magasin;
    if (box) query["details.box"] = box;
    if (mois) query.mois = Number(mois);
    if (annee) query.annee = Number(annee);

    const [items, total] = await Promise.all([
        PaiementLoyer.find(query)
            .populate("magasin", "nomMagasin")
            .populate("details.box", "nomBox aireBox")
            .populate("details.loyerBox", "montantLoyer")
            .sort({ annee: -1, mois: -1, datePaiement: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        PaiementLoyer.countDocuments(query)
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

exports.getPaiementById = async (id) => {
    return PaiementLoyer.findById(id)
        .populate("magasin", "nomMagasin")
    .populate("details.box", "nomBox aireBox")
    .populate("details.loyerBox", "montantLoyer dateDebut dateFin")
        .lean();
};

exports.getPaiementsByMagasin = async (magasinId, queryParams) => {
    return exports.getAllPaiements({ ...queryParams, magasin: magasinId });
};

exports.removePaiement = async (id) => {
    return PaiementLoyer.findByIdAndDelete(id).lean();
};
