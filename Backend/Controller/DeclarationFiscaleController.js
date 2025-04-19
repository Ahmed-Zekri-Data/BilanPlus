const DeclarationFiscale = require("../Models/DeclarationFiscale");
// const DeclarationFiscaleService = require('../services/DeclarationFiscaleService');
const DeclarationFiscaleService = require('../Services/DeclarationFiscaleService');
const DF = DeclarationFiscale;
const mongoose = require('mongoose'); 

// Fonction utilitaire pour vérifier l'existence d'une déclaration par ID
async function findDeclarationById(id) {
    try {
        const declaration = await DF.findById(id);
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
        const newDF = new DF({
            periode: req.body.periode,
            montantTotal: req.body.montantTotal,
            statut: req.body.statut,
            compteComptable: req.body.compteComptable,
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
        const getDF = await DF.find().populate("compteComptable");
        res.status(200).json(getDF);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Récupérer une déclaration fiscale par ID
async function getbyid(req, res) {
    try {
        const getoneDF = await DF.findById(req.params.id).populate("compteComptable");
        if (!getoneDF) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json(getoneDF);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Supprimer une déclaration fiscale
async function deleteDF(req, res) {
    try {
        const DFdeleted = await DF.findByIdAndDelete(req.params.id);
        if (!DFdeleted) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json({ message: "Déclaration supprimée" });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la suppression", error: err.message });
    }
}

// Mettre à jour une déclaration fiscale
async function updateDF(req, res) {
    try {
        const DFupdated = await DF.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!DFupdated) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json({ message: "Déclaration mise à jour", data: DFupdated });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
}

// Générer une déclaration fiscale
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
  
      // Générer la déclaration fiscale complète
      const declarationComplete = await DeclarationFiscaleService.genererDeclarationFiscale(
        new Date(dateDebut),
        new Date(dateFin),
        type
      );
  
      // Convertir l'objet periode en une chaîne de caractères
      const periodeString = `${declarationComplete.periode.debut.toISOString()} - ${declarationComplete.periode.fin.toISOString()}`;
  
      // Calculer le montant total
      const montantTotal =
        declarationComplete.dataSummary.tva.solde +
        declarationComplete.dataSummary.tcl.montantTCL +
        declarationComplete.dataSummary.droitTimbre.totalDroitTimbre;
  
      // Sauvegarder la déclaration dans la base de données
      const nouvelleDeclaration = new DeclarationFiscale({
        periode: periodeString,
        type: declarationComplete.type,
        statut: declarationComplete.statut,
        totalTVACollectee: declarationComplete.dataSummary.tva.collectee,
        totalTVADeductible: declarationComplete.dataSummary.tva.deductible,
        totalTVADue: declarationComplete.dataSummary.tva.solde,
        totalTCL: declarationComplete.dataSummary.tcl.montantTCL,
        totalDroitTimbre: declarationComplete.dataSummary.droitTimbre.totalDroitTimbre,
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
          detailsCalcul: declarationComplete.detailsCalcul,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
// Générer un formulaire officiel
async function genererFormulaireOfficiel(req, res) {
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
        
        // Préparer les données pour le formulaire
        const declarationData = {
            periode: declaration.periode,
            type: declaration.type,
            dataSummary: {
                tva: {
                    collectee: declaration.totalTVACollectee,
                    deductible: declaration.totalTVADeductible,
                    solde: declaration.totalTVADue,
                    aPayer: declaration.totalTVADue > 0,
                    aRembourser: declaration.totalTVADue < 0,
                    montantFinal: Math.abs(declaration.totalTVADue)
                },
                tcl: {
                    montantTCL: declaration.totalTCL
                },
                droitTimbre: {
                    totalDroitTimbre: declaration.totalDroitTimbre
                },
                totalAPayer: declaration.totalTVADue > 0 ? 
                    declaration.totalTVADue + declaration.totalTCL + declaration.totalDroitTimbre : 
                    declaration.totalTCL + declaration.totalDroitTimbre
            }
        };
        
        // Générer le formulaire officiel
        const formulaire = DeclarationFiscaleService.genererFormulaireOfficiel(declarationData);
        
        return res.status(200).json({
            success: true,
            data: formulaire
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Vérifier les délais de déclaration
async function verifierDelaisDeclaration(req, res) {
    try {
        const { type, finPeriode } = req.body;
        
        if (!type || !finPeriode) {
            return res.status(400).json({
                success: false,
                message: 'Le type de déclaration et la date de fin de période sont requis'
            });
        }
        
        const infoDelais = DeclarationFiscaleService.verifierDelaisDeclaration(type, new Date(finPeriode));
        
        return res.status(200).json({
            success: true,
            data: infoDelais
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
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
        
        // Vérifier les délais et calculer les pénalités si nécessaire
        const infoDelais = DeclarationFiscaleService.verifierDelaisDeclaration(
            declaration.type, 
            declaration.periode.fin
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
    genererFormulaireOfficiel,
    verifierDelaisDeclaration,
    soumettreDeclaration
};