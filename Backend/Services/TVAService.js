// Backend/services/TVAService.js
const Facture = require('../Models/Facture');
const Produit = require('../Models/Produit');
const TVA = require('../Models/TVA');

class TVAService {
  /**
   * Calcule la TVA pour une facture spécifique
   * @param {String} factureId - ID de la facture
   * @return {Object} Résultat détaillé du calcul de TVA
   */
  static async calculerTVAFacture(factureId) {
    try {
      const facture = await Facture.findById(factureId).populate('produits');
      
      if (!facture) {
        throw new Error('Facture non trouvée');
      }
      
      // Initialiser les accumulateurs par taux de TVA
      const detailsTVA = {};
      let totalHT = 0;
      let totalTVA = 0;
      
      // Traiter chaque produit de la facture
      for (const produit of facture.produits) {
        const montantHT = produit.prix * produit.quantite;
        totalHT += montantHT;
        
        // Si le taux de TVA n'existe pas encore dans notre objet, l'initialiser
        if (!detailsTVA[produit.tva]) {
          detailsTVA[produit.tva] = {
            baseImposable: 0,
            montantTVA: 0
          };
        }
        
        // Ajouter le montant HT à la base imposable pour ce taux
        detailsTVA[produit.tva].baseImposable += montantHT;
        
        // Calculer la TVA pour ce produit
        const montantTVA = montantHT * (produit.tva / 100);
        detailsTVA[produit.tva].montantTVA += montantTVA;
        totalTVA += montantTVA;
      }
      
      return {
        factureId,
        reference: facture.reference,
        client: facture.clientId,
        date: facture.date,
        totalHT,
        totalTVA,
        totalTTC: totalHT + totalTVA,
        detailsTVA
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Calcule la TVA déductible à partir des factures fournisseurs
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @return {Object} Résumé de la TVA déductible
   */
  static async calculerTVADeductible(dateDebut, dateFin) {
    try {
      // Supposons que les factures fournisseurs ont un champ 'type' = 'achat'
      const facturesFournisseurs = await Facture.find({
        date: { $gte: dateDebut, $lte: dateFin },
        type: 'achat',
        statut: { $in: ['validée', 'payée'] } // Ne considérer que les factures validées/payées
      }).populate('produits');
      
      let totalTVADeductible = 0;
      const detailsParFournisseur = {};
      
      for (const facture of facturesFournisseurs) {
        let tvaMontantFacture = 0;
        
        // Calculer la TVA pour chaque produit de la facture
        for (const produit of facture.produits) {
          const montantHT = produit.prix * produit.quantite;
          const montantTVA = montantHT * (produit.tva / 100);
          tvaMontantFacture += montantTVA;
        }
        
        // Ajouter au total déductible
        totalTVADeductible += tvaMontantFacture;
        
        // Regrouper par fournisseur pour le rapport
        if (!detailsParFournisseur[facture.fournisseurId]) {
          detailsParFournisseur[facture.fournisseurId] = 0;
        }
        detailsParFournisseur[facture.fournisseurId] += tvaMontantFacture;
      }
      
      return {
        periode: { debut: dateDebut, fin: dateFin },
        totalTVADeductible,
        detailsParFournisseur
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Réconcilie la TVA collectée et déductible pour une période donnée
   * @param {Date} dateDebut - Date de début de période
   * @param {Date} dateFin - Date de fin de période
   * @return {Object} Bilan TVA pour la période
   */
  static async reconciliationTVA(dateDebut, dateFin) {
    try {
      // Calcul TVA collectée (factures de vente)
      const facturesVente = await Facture.find({
        date: { $gte: dateDebut, $lte: dateFin },
        type: 'vente',
        statut: { $in: ['validée', 'payée'] }
      }).populate('produits');
      
      let totalTVACollectee = 0;
      
      for (const facture of facturesVente) {
        for (const produit of facture.produits) {
          const montantHT = produit.prix * produit.quantite;
          const montantTVA = montantHT * (produit.tva / 100);
          totalTVACollectee += montantTVA;
        }
      }
      
      // Obtenir la TVA déductible
      const { totalTVADeductible } = await this.calculerTVADeductible(dateDebut, dateFin);
      
      // Calcul du solde TVA
      const soldeTVA = totalTVACollectee - totalTVADeductible;
      
      return {
        periode: { debut: dateDebut, fin: dateFin },
        totalTVACollectee,
        totalTVADeductible,
        soldeTVA,
        aRembourser: soldeTVA < 0,
        aPayer: soldeTVA > 0,
        montantFinal: Math.abs(soldeTVA)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vérifie si une entreprise est éligible au régime forfaitaire
   * @param {Object} entreprise - Informations sur l'entreprise
   * @param {Number} chiffreAffairesAnnuel - CA annuel
   * @return {Boolean} Éligibilité au régime forfaitaire
   */
  static verifierEligibiliteRegimeForfaitaire(entreprise, chiffreAffairesAnnuel) {
    // En Tunisie, les conditions pour le régime forfaitaire incluent:
    // - CA annuel inférieur à 100 000 DT pour les activités de services
    // - CA annuel inférieur à 200 000 DT pour les activités d'achat/revente
    
    const limiteCA = entreprise.secteurActivite === 'services' ? 100000 : 200000;
    return chiffreAffairesAnnuel < limiteCA;
  }
}

module.exports = TVAService;