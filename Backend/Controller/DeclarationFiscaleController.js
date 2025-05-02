const DeclarationFiscale = require("../Models/DeclarationFiscale");
const TVA = require("../Models/TVA");
const Facture = require("../Models/Facture");
const Produit = require("../Models/Produit");
const Client = require("../Models/Client");
const mongoose = require('mongoose');
const DeclarationFiscaleService = require('../Services/DeclarationFiscaleService');

// Fonction utilitaire pour vérifier l'existence d'une déclaration par ID
async function findDeclarationById(id) {
    try {
        const declaration = await DeclarationFiscale.findById(id);
        if (!declaration) {
            throw new Error("Déclaration non trouvée");
        }
        return declaration;
    } catch (err) {
        throw new Error(err.message);
    }
}

// Ajouter une déclaration fiscale
async function addDF(req, res) {
    try {
        const newDF = new DeclarationFiscale({
            periode: req.body.periode,
            montantTotal: req.body.montantTotal,
            statut: req.body.statut,
            compteComptable: req.body.compteComptable,
            type: req.body.type,
            totalTVACollectee: req.body.totalTVACollectee || 0,
            totalTVADeductible: req.body.totalTVADeductible || 0,
            totalTVADue: req.body.totalTVADue || 0,
            totalTCL: req.body.totalTCL || 0,
            totalDroitTimbre: req.body.totalDroitTimbre || 0,
        });
        await newDF.save();
        res.status(201).json({ message: "Déclaration fiscale ajoutée", data: newDF });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de l'ajout de la déclaration", error: err.message });
    }
}

// Récupérer toutes les déclarations fiscales
async function getall(req, res) {
    try {
        const getDF = await DeclarationFiscale.find().populate("compteComptable");
        res.status(200).json(getDF);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Récupérer une déclaration fiscale par ID
async function getbyid(req, res) {
    try {
        const getoneDF = await DeclarationFiscale.findById(req.params.id).populate("compteComptable");
        if (!getoneDF) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json(getoneDF);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Supprimer une déclaration fiscale et ses TVAs associées
async function deleteDF(req, res) {
    try {
        const declarationId = req.params.id;

        // Vérifier si la déclaration existe
        const declaration = await DeclarationFiscale.findById(declarationId);
        if (!declaration) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }

        // Supprimer toutes les TVAs associées
        await TVA.deleteMany({ declaration: declarationId });

        // Supprimer la déclaration
        await DeclarationFiscale.findByIdAndDelete(declarationId);

        res.status(200).json({ message: "Déclaration et TVAs associées supprimées" });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la suppression", error: err.message });
    }
}

// Mettre à jour une déclaration fiscale
async function updateDF(req, res) {
    try {
        const DFupdated = await DeclarationFiscale.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!DFupdated) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json({ message: "Déclaration mise à jour", data: DFupdated });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
}

// Générer une déclaration fiscale (avec calculs automatiques corrigés)
async function findCompteComptableById(id) {
    try {
        const compteComptable = await mongoose.model('CompteComptable').findById(id);
        if (!compteComptable) {
            throw new Error('Compte comptable non trouvé');
        }
        return compteComptable;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function genererDeclarationFiscale(req, res) {
    try {
        const { dateDebut, dateFin, type, compteComptable } = req.body;

        // Vérifier les champs requis
        if (!dateDebut || !dateFin || !type) {
            return res.status(400).json({
                success: false,
                message: 'Les dates de début et de fin ainsi que le type de déclaration sont requis',
            });
        }

        // Vérifier le type de déclaration
        if (!['mensuelle', 'trimestrielle', 'annuelle'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Le type de déclaration doit être "mensuelle", "trimestrielle" ou "annuelle"',
            });
        }

        // Vérifier et valider compteComptable
        if (!compteComptable) {
            return res.status(400).json({
                success: false,
                message: 'Le champ compteComptable est requis',
            });
        }

        if (!mongoose.isValidObjectId(compteComptable)) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID du compte comptable est invalide (doit être un ObjectId valide)',
            });
        }

        // Vérifier si le compte comptable existe
        await findCompteComptableById(compteComptable);

        // Convertir les dates en objets Date
        const startDate = new Date(dateDebut);
        const endDate = new Date(dateFin);

        // Récupérer toutes les factures dans la période donnée
        const factures = await Facture.find({
            echeance: { $gte: startDate, $lte: endDate },
            statut: { $in: ['validée', 'payée'] }
        }).populate('produits client');

        let totalTVACollectee = 0;
        let totalTVADeductible = 0;
        let totalTCL = 0;
        let totalDroitTimbre = 0;

        // Définir les IDs des clients pour différencier ventes et achats
        const clientVenteId = "6814f8f93de7102adae5666b"; // Client pour les ventes
        const clientAchatId = "6814f9143de7102adae5666d"; // Client pour les achats

        // Calculer TVA, TCL et DroitTimbre pour chaque facture
        for (const facture of factures) {
            let montantHT = 0;
            if (facture.produits && facture.produits.length > 0) {
                // Utiliser le prix du produit comme base pour le montant HT
                montantHT = facture.produits[0].prix || (facture.montant / 1.19); // Prendre le premier produit
            } else {
                montantHT = facture.montant / 1.19; // Si pas de produits, utiliser le montant total
            }
            const montantTVA = montantHT * 0.19;

            // Différencier ventes et achats en fonction du client
            const clientId = facture.client ? facture.client._id.toString() : null;
            if (clientId === clientVenteId) {
                totalTVACollectee += montantTVA;
                // Calculer TCL uniquement pour les ventes
                totalTCL += (facture.montant || 0) * 0.002;
            } else if (clientId === clientAchatId) {
                totalTVADeductible += montantTVA;
            }

            // Calculer DroitTimbre (0.6 DT par facture valide)
            if (facture.statut === 'validée' || facture.statut === 'payée') {
                totalDroitTimbre += 0.6;
            }
        }

        // Calculer totalTVADue
        const totalTVADue = totalTVACollectee - totalTVADeductible;

        // Convertir la période en une chaîne de caractères
        const periodeString = `${startDate.toISOString()} - ${endDate.toISOString()}`;

        // Calculer le montant total
        const montantTotal = totalTVADue + totalTCL + totalDroitTimbre;

        // Sauvegarder la déclaration dans la base de données
        const nouvelleDeclaration = new DeclarationFiscale({
            periode: periodeString,
            type: type,
            statut: 'brouillon',
            totalTVACollectee: totalTVACollectee,
            totalTVADeductible: totalTVADeductible,
            totalTVADue: totalTVADue,
            totalTCL: totalTCL,
            totalDroitTimbre: totalDroitTimbre,
            dateCreation: new Date(),
            montantTotal: montantTotal,
            compteComptable: compteComptable,
        });

        await nouvelleDeclaration.save();

        return res.status(201).json({
            success: true,
            message: 'Déclaration fiscale générée avec succès',
            data: {
                declaration: nouvelleDeclaration,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// Soumettre une déclaration fiscale
async function soumettreDeclaration(req, res) {
    try {
        const { declarationId } = req.params;

        // Récupérer la déclaration
        const declaration = await DeclarationFiscale.findById(declarationId);

        if (!declaration) {
            return res.status(404).json({
                success: false,
                message: 'Déclaration fiscale non trouvée'
            });
        }

        // Vérifier si la déclaration est déjà soumise
        if (declaration.statut === 'soumise' || declaration.statut === 'validée') {
            return res.status(400).json({
                success: false,
                message: `La déclaration est déjà ${declaration.statut}`
            });
        }

        // Extraire la date de fin de période à partir de la chaîne periode
        const periodeParts = declaration.periode.split(' - ');
        if (periodeParts.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Format de période invalide. Attendu : "YYYY-MM-DD - YYYY-MM-DD"'
            });
        }
        const finPeriode = new Date(periodeParts[1]);

        // Vérifier les délais et calculer les pénalités si nécessaire
        const infoDelais = DeclarationFiscaleService.verifierDelaisDeclaration(
            declaration.type, 
            finPeriode
        );

        // Mettre à jour la déclaration
        declaration.statut = 'soumise';
        declaration.dateSoumission = new Date();

        // Ajouter les pénalités si en retard
        if (infoDelais.estEnRetard) {
            declaration.penalites = {
                estEnRetard: true,
                retardJours: infoDelais.retardJours,
                tauxPenalite: infoDelais.penalites.totalPenalites,
                montantPenalite: (declaration.totalTVADue > 0 ? declaration.totalTVADue : 0) * (infoDelais.penalites.totalPenalites / 100)
            };
        }

        await declaration.save();

        return res.status(200).json({
            success: true,
            message: 'Déclaration fiscale soumise avec succès',
            data: {
                declaration,
                infoDelais: infoDelais.estEnRetard ? infoDelais : null
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Exporter toutes les méthodes
module.exports = {
    addDF,
    getall,
    getbyid,
    deleteDF,
    updateDF,
    findDeclarationById,
    genererDeclarationFiscale,
    soumettreDeclaration
};