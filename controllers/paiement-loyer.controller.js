const paiementLoyerService = require("../services/paiement-loyer.service");

function mapErrorToStatus(error) {
    if (
        error.message.includes("obligatoires") ||
        error.message.includes("doit être") ||
        error.message.includes("déjà payé")
    ) {
        return 400;
    }

    if (
        error.message.includes("Aucune association active") ||
        error.message.includes("Aucun loyer actif")
    ) {
        return 404;
    }

    return 500;
}

exports.save = async (req, res) => {
    try {
        const paiement = await paiementLoyerService.createPaiement(req.body);
        res.status(201).json({
            success: true,
            data: paiement,
            message: "Paiement de loyer enregistré"
        });
    } catch (error) {
        res.status(mapErrorToStatus(error)).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const result = await paiementLoyerService.getAllPaiements(req.query);
        res.status(200).json({
            success: true,
            data: result,
            message: "Liste des paiements récupérée"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const paiement = await paiementLoyerService.getPaiementById(req.params.id);
        if (!paiement) {
            return res.status(404).json({
                success: false,
                message: "Paiement de loyer non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: paiement,
            message: "Paiement récupéré"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getByMagasin = async (req, res) => {
    try {
        const result = await paiementLoyerService.getPaiementsByMagasin(req.params.magasinId, req.query);
        res.status(200).json({
            success: true,
            data: result,
            message: "Paiements du magasin récupérés"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await paiementLoyerService.removePaiement(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Paiement de loyer non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: deleted,
            message: "Paiement de loyer supprimé"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
