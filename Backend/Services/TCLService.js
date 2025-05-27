// Backend/services/TCLService.js
const Facture = require('../Models/Facture');
const Client = require('../Models/Client');

class TCLService {
  /**
   * Calcule la Taxe sur les Collectivités Locales (TCL) pour une période donnée
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @param {Number} tauxTCL - Taux TCL (par défaut 0.2%)
   * @return {Object} Résultat du calcul TCL
   */
  static async calculerTCL(dateDebut, dateFin, tauxTCL = 0.2) {
    try {
      // Récupérer toutes les factures de vente de la période
      const factures = await Facture.find({
        date: { $gte: dateDebut, $lte: dateFin },
        type: 'vente',
        statut: { $in: ['validée', 'payée'] }
      });
      
      // Calculer le chiffre d'affaires total (base imposable)
      let chiffreAffairesHT = 0;
      
      for (const facture of factures) {
        // On ne prend que le montant HT pour la TCL
        chiffreAffairesHT += facture.montantHT || 0;
      }
      
      // Calculer le montant de la TCL
      const montantTCL = (chiffreAffairesHT * tauxTCL) / 100;
      
      return {
        periode: { debut: dateDebut, fin: dateFin },
        chiffreAffairesHT,
        tauxTCL,
        montantTCL
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Calcule la TCL par commune/municipalité
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @return {Object} Répartition TCL par commune
   */
  static async calculerTCLParCommune(dateDebut, dateFin) {
    try {
      // Récupérer toutes les factures de vente de la période avec clients
      const factures = await Facture.find({
        date: { $gte: dateDebut, $lte: dateFin },
        type: 'vente',
        statut: { $in: ['validée', 'payée'] }
      }).populate('clientId');
      
      // Regrouper les montants par commune
      const communesCA = {};
      
      for (const facture of factures) {
        // S'assurer que le client existe et a une commune
        if (facture.clientId && facture.clientId.adresse && facture.clientId.adresse.commune) {
          const commune = facture.clientId.adresse.commune;
          
          if (!communesCA[commune]) {
            communesCA[commune] = 0;
          }
          
          communesCA[commune] += facture.montantHT || 0;
        }
      }
      
      // Calculer TCL par commune
      const tcl = {};
      let totalTCL = 0;
      
      for (const commune in communesCA) {
        const ca = communesCA[commune];
        const montantTCL = (ca * 0.2) / 100; // Taux standard de 0.2%
        
        tcl[commune] = {
          chiffreAffairesHT: ca,
          tauxTCL: 0.2,
          montantTCL
        };
        
        totalTCL += montantTCL;
      }
      
      return {
        periode: { debut: dateDebut, fin: dateFin },
        repartitionParCommune: tcl,
        totalTCL
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Vérifie les exonérations de TCL possibles
   * @param {String} secteurActivite - Secteur d'activité
   * @return {Object} Informations sur l'exonération
   */
  static verifierExonerationTCL(secteurActivite) {
    // Certains secteurs peuvent être exonérés de TCL
    const secteursExoneres = [
      'agriculture',
      'pêche',
      'artisanat traditionnel',
      'exportation'
    ];
    
    const exonere = secteursExoneres.includes(secteurActivite.toLowerCase());
    
    return {
      secteurActivite,
      exonere,
      justification: exonere ? `Le secteur ${secteurActivite} bénéficie d'une exonération de TCL` : null
    };
  }
}

module.exports = TCLService;
