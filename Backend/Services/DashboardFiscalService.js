// Backend/services/DashboardFiscalService.js
const TVAService = require('./TVAService');
const TCLService = require('./TCLService');
const DroitTimbreService = require('./DroitTimbreService');
const DeclarationFiscale = require('../Models/DeclarationFiscale');

class DashboardFiscalService {
  /**
   * Génère un tableau de bord fiscal complet
   * @param {Number} annee - Année fiscale
   * @return {Object} Données pour le tableau de bord fiscal
   */
  static async genererDashboardFiscal(annee) {
    try {
      // Définir les dates de l'année fiscale
      const dateDebut = new Date(annee, 0, 1); // 1er janvier
      const dateFin = new Date(annee, 11, 31); // 31 décembre
      
      // Récupérer les déclarations fiscales de l'année
      const declarations = await DeclarationFiscale.find({
        'periode.debut': { $gte: dateDebut },
        'periode.fin': { $lte: dateFin }
      }).sort({ 'periode.debut': 1 });
      
      // Récupérer les données TVA pour l'année
      const bilanTVA = await TVAService.reconciliationTVA(dateDebut, dateFin);
      
      // Récupérer les données TCL pour l'année
      const bilanTCL = await TCLService.calculerTCL(dateDebut, dateFin);
      
      // Récupérer les données Droit de Timbre pour l'année
      const bilanDroitTimbre = await DroitTimbreService.calculerDroitTimbrePeriode(dateDebut, dateFin);
      
      // Calculer les indicateurs par période (mensuel ou trimestriel)
      const indicateursMensuels = await this.calculerIndicateursMensuels(annee);
      
      // Construire le dashboard
      const dashboard = {
        annee,
        resume: {
          totalTVACollectee: bilanTVA.totalTVACollectee,
          totalTVADeductible: bilanTVA.totalTVADeductible,
          soldeTVA: bilanTVA.soldeTVA,
          totalTCL: bilanTCL.montantTCL,
          totalDroitTimbre: bilanDroitTimbre.totalDroitTimbre,
          totalChargesFiscales: 
            (bilanTVA.soldeTVA > 0 ? bilanTVA.soldeTVA : 0) + 
            bilanTCL.montantTCL + 
            bilanDroitTimbre.totalDroitTimbre
        },
        declarations: declarations.map(d => ({
          id: d._id,
          periode: d.periode,
          type: d.type,
          statut: d.statut,
          tvaDue: d.totalTVADue,
          tcl: d.totalTCL,
          droitTimbre: d.totalDroitTimbre,
          totalAPayer: 
            (d.totalTVADue > 0 ? d.totalTVADue : 0) + 
            d.totalTCL + 
            d.totalDroitTimbre,
          dateCreation: d.dateCreation,
          dateSoumission: d.dateSoumission
        })),
        indicateursMensuels,
        tendances: {
          evolution: this.calculerEvolutionChargesFiscales(indicateursMensuels),
          previsions: this.estimerPrevisionsFiscales(indicateursMensuels)
        }
      };
      
      return dashboard;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Calcule les indicateurs mensuels
   * @param {Number} annee - Année fiscale
   * @return {Array} Indicateurs par mois
   */
  static async calculerIndicateursMensuels(annee) {
    const indicateurs = [];
    
    for (let mois = 0; mois < 12; mois++) {
      const dateDebut = new Date(annee, mois, 1);
      const dateFin = new Date(annee, mois + 1, 0); // Dernier jour du mois
      
      try {
        const bilanTVA = await TVAService.reconciliationTVA(dateDebut, dateFin);
        const bilanTCL = await TCLService.calculerTCL(dateDebut, dateFin);
        const bilanDroitTimbre = await DroitTimbreService.calculerDroitTimbrePeriode(dateDebut, dateFin);
        
        indicateurs.push({
          mois: mois + 1,
          nomMois: new Date(annee, mois, 1).toLocaleString('fr-FR', { month: 'long' }),
          tvaCollectee: bilanTVA.totalTVACollectee,
          tvaDeductible: bilanTVA.totalTVADeductible,
          soldeTVA: bilanTVA.soldeTVA,
          tcl: bilanTCL.montantTCL,
          droitTimbre: bilanDroitTimbre.totalDroitTimbre,
          totalChargesFiscales: 
            (bilanTVA.soldeTVA > 0 ? bilanTVA.soldeTVA : 0) + 
            bilanTCL.montantTCL + 
            bilanDroitTimbre.totalDroitTimbre
        });
      } catch (error) {
        // En cas d'erreur, ajouter un mois avec des valeurs nulles
        indicateurs.push({
          mois: mois + 1,
          nomMois: new Date(annee, mois, 1).toLocaleString('fr-FR', { month: 'long' }),
          tvaCollectee: 0,
          tvaDeductible: 0,
          soldeTVA: 0,
          tcl: 0,
          droitTimbre: 0,
          totalChargesFiscales: 0
        });
      }
    }
    
    return indicateurs;
  }
  
  /**
   * Calcule l'évolution des charges fiscales
   * @param {Array} indicateursMensuels - Indicateurs mensuels
   * @return {Object} Évolution des charges fiscales
   */
  static calculerEvolutionChargesFiscales(indicateursMensuels) {
    const evolution = {
      tvaCollectee: [],
      tvaDeductible: [],
      soldeTVA: [],
      tcl: [],
      droitTimbre: [],
      totalChargesFiscales: []
    };
    
    // Organiser les données pour les graphiques
    indicateursMensuels.forEach(indic => {
      evolution.tvaCollectee.push({ mois: indic.nomMois, valeur: indic.tvaCollectee });
      evolution.tvaDeductible.push({ mois: indic.nomMois, valeur: indic.tvaDeductible });
      evolution.soldeTVA.push({ mois: indic.nomMois, valeur: indic.soldeTVA });
      evolution.tcl.push({ mois: indic.nomMois, valeur: indic.tcl });
      evolution.droitTimbre.push({ mois: indic.nomMois, valeur: indic.droitTimbre });
      evolution.totalChargesFiscales.push({ mois: indic.nomMois, valeur: indic.totalChargesFiscales });
    });
    
    return evolution;
  }
  
  /**
   * Estime les prévisions fiscales pour les mois à venir
   * @param {Array} indicateursMensuels - Indicateurs mensuels
   * @return {Object} Prévisions fiscales
   */
  static estimerPrevisionsFiscales(indicateursMensuels) {
    // Pour simplifier, nous utilisons une moyenne mobile des 3 derniers mois
    // disponibles pour prévoir les 3 prochains mois
    const derniersMois = indicateursMensuels.slice(-3);
    
    if (derniersMois.length === 0) {
      return null;
    }
    
    // Calculer les moyennes
    const moyenne = {
      tvaCollectee: derniersMois.reduce((sum, m) => sum + m.tvaCollectee, 0) / derniersMois.length,
      tvaDeductible: derniersMois.reduce((sum, m) => sum + m.tvaDeductible, 0) / derniersMois.length,
      soldeTVA: derniersMois.reduce((sum, m) => sum + m.soldeTVA, 0) / derniersMois.length,
      tcl: derniersMois.reduce((sum, m) => sum + m.tcl, 0) / derniersMois.length,
      droitTimbre: derniersMois.reduce((sum, m) => sum + m.droitTimbre, 0) / derniersMois.length,
      totalChargesFiscales: derniersMois.reduce((sum, m) => sum + m.totalChargesFiscales, 0) / derniersMois.length
    };
    
    // Appliquer une tendance simple (croissance de 2% par mois)
    const previsions = [];
    const dernierMois = indicateursMensuels[indicateursMensuels.length - 1].mois;
    
    for (let i = 1; i <= 3; i++) {
      const moisSuivant = (dernierMois + i) % 12 || 12; // Gérer le passage à l'année suivante
      const facteurCroissance = 1 + (0.02 * i); // 2% de croissance par mois
      
      previsions.push({
        mois: moisSuivant,
        nomMois: new Date(2024, moisSuivant - 1, 1).toLocaleString('fr-FR', { month: 'long' }),
        tvaCollectee: moyenne.tvaCollectee * facteurCroissance,
        tvaDeductible: moyenne.tvaDeductible * facteurCroissance,
        soldeTVA: moyenne.soldeTVA * facteurCroissance,
        tcl: moyenne.tcl * facteurCroissance,
        droitTimbre: moyenne.droitTimbre * facteurCroissance,
        totalChargesFiscales: moyenne.totalChargesFiscales * facteurCroissance
      });
    }
    
    return previsions;
  }
}

module.exports = DashboardFiscalService;