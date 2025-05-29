// Backend/services/DroitTimbreService.js
const Facture = require('../Models/Facture');

class DroitTimbreService {
  /**
   * Calcule le droit de timbre pour une facture spécifique
   * @param {String} factureId - ID de la facture
   * @param {Number} valeurTimbre - Valeur du timbre (par défaut 0.6 DT)
   * @return {Object} Résultat du calcul du droit de timbre
   */
  static async calculerDroitTimbreFacture(factureId, valeurTimbre = 0.6) {
    try {
      const facture = await Facture.findById(factureId);
      
      if (!facture) {
        throw new Error('Facture non trouvée');
      }
      
      // Vérifier si la facture est soumise au droit de timbre
      const estSoumise = this.verifierSiSoumisAuTimbre(facture);
      
      // Calculer le montant du droit de timbre
      const montantDroitTimbre = estSoumise ? valeurTimbre : 0;
      
      return {
        factureId,
        reference: facture.reference,
        date: facture.date,
        estSoumisAuDroitDeTimbre: estSoumise,
        valeurTimbre,
        montantDroitTimbre
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Vérifie si une facture est soumise au droit de timbre
   * @param {Object} facture - Objet facture
   * @return {Boolean} Soumise au droit de timbre ou non
   */
  static verifierSiSoumisAuTimbre(facture) {
    // En Tunisie, certaines factures sont exonérées du droit de timbre:
    // - Factures d'exportation
    // - Factures électroniques (dans certains cas)
    // - Certains types de transactions

    // Vérifie si c'est une facture d'exportation
    const estExportation = facture.type === 'vente' && facture.marche === 'exportation';
    
    // Vérifie si c'est une facture électronique certifiée
    const estElectroniqueCertifiee = facture.format === 'electronique' && facture.estCertifiee === true;
    
    // Vérifie si le montant est inférieur au seuil (exemple fictif)
    const estSousSeuil = facture.montantTotal < 10; // Seuil fictif
    
    // La facture est soumise si aucune exonération ne s'applique
    return !(estExportation || estElectroniqueCertifiee || estSousSeuil);
  }
  
  /**
   * Calcule le droit de timbre pour une période donnée
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @return {Object} Résumé des droits de timbre
   */
  static async calculerDroitTimbrePeriode(dateDebut, dateFin) {
    try {
      // Récupérer toutes les factures de la période
      const factures = await Facture.find({
        date: { $gte: dateDebut, $lte: dateFin }
      });
      
      let totalDroitTimbre = 0;
      let nombreFacturesSoumises = 0;
      let nombreFacturesExonerees = 0;
      
      for (const facture of factures) {
        const estSoumise = this.verifierSiSoumisAuTimbre(facture);
        
        if (estSoumise) {
          totalDroitTimbre += 0.6; // Valeur standard du timbre
          nombreFacturesSoumises++;
        } else {
          nombreFacturesExonerees++;
        }
      }
      
      return {
        periode: { debut: dateDebut, fin: dateFin },
        totalFactures: factures.length,
        nombreFacturesSoumises,
        nombreFacturesExonerees,
        valeurUnitaireTimbre: 0.6,
        totalDroitTimbre
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Génère un rapport détaillé des droits de timbre par type de document
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @return {Object} Rapport détaillé
   */
  static async genererRapportDroitTimbre(dateDebut, dateFin) {
    try {
      // En plus des factures, nous pouvons inclure d'autres documents soumis au droit de timbre
      // comme les contrats, quittances, etc.
      
      // Récupérer les factures
      const factures = await Facture.find({
        date: { $gte: dateDebut, $lte: dateFin }
      });
      
      // Pour cet exemple, nous nous concentrons sur les factures
      // Dans une implémentation réelle, il faudrait ajouter d'autres types de documents
      
      const rapport = {
        periode: { debut: dateDebut, fin: dateFin },
        droitsParTypeDocument: {
          factures: {
            nombre: 0,
            montantTotal: 0
          },
          contrats: {
            nombre: 0,
            montantTotal: 0
          },
          quittances: {
            nombre: 0,
            montantTotal: 0
          }
        },
        totalDocuments: 0,
        totalDroitTimbre: 0
      };
      
      // Traiter les factures
      for (const facture of factures) {
        const estSoumise = this.verifierSiSoumisAuTimbre(facture);
        
        if (estSoumise) {
          rapport.droitsParTypeDocument.factures.nombre++;
          rapport.droitsParTypeDocument.factures.montantTotal += 0.6;
          rapport.totalDocuments++;
          rapport.totalDroitTimbre += 0.6;
        }
      }
      
      return rapport;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DroitTimbreService;
