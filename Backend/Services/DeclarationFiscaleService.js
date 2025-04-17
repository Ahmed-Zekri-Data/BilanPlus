// Backend/services/DeclarationFiscaleService.js
const DeclarationFiscale = require('../Models/DeclarationFiscale');
const TVAService = require('./TVAService');
const TCLService = require('./TCLService');
const DroitTimbreService = require('./DroitTimbreService');

class DeclarationFiscaleService {
  /**
   * Génère une déclaration fiscale complète
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @param {String} type - Type de déclaration (mensuelle, trimestrielle, annuelle)
   * @return {Object} Déclaration fiscale complète
   */
  static async genererDeclarationFiscale(dateDebut, dateFin, type) {
    try {
      // 1. Calculer la réconciliation TVA
      const bilanTVA = await TVAService.reconciliationTVA(dateDebut, dateFin);
      
      // 2. Calculer la TCL
      const bilanTCL = await TCLService.calculerTCL(dateDebut, dateFin);
      
      // 3. Calculer le droit de timbre
      const bilanDroitTimbre = await DroitTimbreService.calculerDroitTimbrePeriode(dateDebut, dateFin);
      
      // 4. Créer un objet déclaration fiscale complète
      const declarationComplete = {
        periode: { debut: dateDebut, fin: dateFin },
        type,
        statut: 'brouillon',
        dateCreation: new Date(),
        dataSummary: {
          tva: {
            collectee: bilanTVA.totalTVACollectee,
            deductible: bilanTVA.totalTVADeductible,
            solde: bilanTVA.soldeTVA,
            aRembourser: bilanTVA.aRembourser,
            aPayer: bilanTVA.aPayer,
            montantFinal: bilanTVA.montantFinal
          },
          tcl: {
            chiffreAffairesHT: bilanTCL.chiffreAffairesHT,
            tauxTCL: bilanTCL.tauxTCL,
            montantTCL: bilanTCL.montantTCL
          },
          droitTimbre: {
            nombreDocuments: bilanDroitTimbre.totalFactures,
            totalDroitTimbre: bilanDroitTimbre.totalDroitTimbre
          },
          totalAPayer: bilanTVA.aPayer ? bilanTVA.montantFinal : 0,
          totalARestituer: bilanTVA.aRembourser ? bilanTVA.montantFinal : 0
        },
        detailsCalcul: {
          tva: bilanTVA,
          tcl: bilanTCL,
          droitTimbre: bilanDroitTimbre
        }
      };
      
      // Calculer le total à payer de la déclaration (TVA + TCL + Droit de Timbre)
      declarationComplete.dataSummary.totalAPayer += bilanTCL.montantTCL + bilanDroitTimbre.totalDroitTimbre;
      
      return declarationComplete;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Génère une prévisualisation du formulaire officiel de déclaration
   * @param {Object} declarationData - Données de la déclaration
   * @return {Object} Données formatées pour le formulaire officiel
   */
  static genererFormulaireOfficiel(declarationData) {
    // Cette fonction formatera les données au format requis par l'administration fiscale
    const { periode, dataSummary } = declarationData;
    
    // Exemple de structure pour un formulaire de déclaration TVA
    const formulaire = {
      identificationContribuable: {
        matriculeFiscal: '12345678X', // À récupérer depuis le profil de l'entreprise
        raisonSociale: 'ENTREPRISE DEMO', // À récupérer depuis le profil
        adresse: 'Rue de la République, Tunis', // À récupérer depuis le profil
      },
      periodeImposition: {
        type: declarationData.type,
        debut: periode.debut,
        fin: periode.fin
      },
      operationsImposables: {
        ventesLocales: dataSummary.tva.collectee,
        exportations: 0, // À calculer si nécessaire
        prestationsServices: 0, // À calculer si nécessaire
        autresOperations: 0, // À calculer si nécessaire
        totalOperationsImposables: dataSummary.tva.collectee
      },
      tvaDeductible: {
        achatsLocaux: dataSummary.tva.deductible,
        importations: 0, // À calculer si nécessaire
        immobilisations: 0, // À calculer si nécessaire
        autresDeductions: 0, // À calculer si nécessaire
        totalTVADeductible: dataSummary.tva.deductible
      },
      resultatDeclaration: {
        tvaDue: dataSummary.tva.aPayer ? dataSummary.tva.montantFinal : 0,
        creditTVA: dataSummary.tva.aRembourser ? dataSummary.tva.montantFinal : 0,
        tcl: dataSummary.tcl.montantTCL,
        droitTimbre: dataSummary.droitTimbre.totalDroitTimbre,
        totalAPayer: dataSummary.totalAPayer
      },
      signatureDeclarant: {
        nom: '',
        qualite: '',
        date: new Date()
      }
    };
    
    return formulaire;
  }
  
  /**
   * Vérifie si la déclaration est en retard
   * @param {String} type - Type de déclaration
   * @param {Date} finPeriode - Fin de la période concernée
   * @return {Object} Informations sur les délais
   */
  static verifierDelaisDeclaration(type, finPeriode) {
    const dateActuelle = new Date();
    let dateEcheance;
    
    // Déterminer la date d'échéance selon le type de déclaration
    switch (type) {
      case 'mensuelle':
        // En Tunisie, la déclaration mensuelle est généralement due le 28 du mois suivant
        dateEcheance = new Date(finPeriode);
        dateEcheance.setMonth(dateEcheance.getMonth() + 1);
        dateEcheance.setDate(28);
        break;
        
      case 'trimestrielle':
        // La déclaration trimestrielle est due à la fin du mois suivant le trimestre
        dateEcheance = new Date(finPeriode);
        dateEcheance.setMonth(dateEcheance.getMonth() + 1);
        dateEcheance.setDate(28);
        break;
        
      case 'annuelle':
        // La déclaration annuelle est généralement due avant le 25 février de l'année suivante
        dateEcheance = new Date(finPeriode.getFullYear() + 1, 1, 25); // 25 février de l'année suivante
        break;
        
      default:
        throw new Error('Type de déclaration non reconnu');
    }
    
    // Calculer le retard en jours
    const differenceTemps = dateActuelle.getTime() - dateEcheance.getTime();
    const retardJours = Math.ceil(differenceTemps / (1000 * 3600 * 24));
    
    // Définir les pénalités de retard (valeurs fictives à adapter selon la législation tunisienne)
    const tauxPenaliteRetard = 0.5; // 0.5% par mois de retard
    const tauxPenaliteFixe = 1; // 1% fixe pour tout retard
    
    // Calculer les pénalités (à adapter selon les règles réelles)
    const estEnRetard = retardJours > 0;
    const moisRetard = Math.ceil(retardJours / 30);
    const penaliteRetard = estEnRetard ? moisRetard * tauxPenaliteRetard : 0;
    const penaliteFixe = estEnRetard ? tauxPenaliteFixe : 0;
    
    return {
      type,
      finPeriode,
      dateEcheance,
      dateActuelle,
      estEnRetard,
      retardJours: estEnRetard ? retardJours : 0,
      penalites: {
        tauxPenaliteRetard, // % par mois
        tauxPenaliteFixe, // % fixe
        totalPenalites: penaliteRetard + penaliteFixe // % total
      }
    };
  }
}

module.exports = DeclarationFiscaleService;
