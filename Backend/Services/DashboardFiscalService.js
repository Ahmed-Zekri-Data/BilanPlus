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

      console.log(`Période fiscale: du ${dateDebut.toISOString()} au ${dateFin.toISOString()}`);

      // Récupérer les déclarations fiscales de l'année
      // Utiliser une approche plus robuste pour la comparaison des dates
      // Convertir les dates en chaînes de caractères pour la comparaison
      const anneeStr = annee.toString();
      console.log(`Recherche des déclarations fiscales pour l'année ${anneeStr}`);

      // Rechercher les déclarations dont la période contient l'année demandée
      const declarations = await DeclarationFiscale.find({
        'periode': { $regex: anneeStr }
      }).sort({ 'periode': 1 });

      console.log(`Nombre de déclarations trouvées pour ${annee}: ${declarations.length}`);

      // Afficher les détails des déclarations trouvées pour le débogage
      if (declarations.length > 0) {
        declarations.forEach((d, index) => {
          console.log(`Déclaration ${index + 1}:`, {
            id: d._id,
            periode: d.periode,
            type: d.type,
            statut: d.statut
          });
        });
      }

      // Pour toutes les années, vérifier si des données existent
      if (declarations.length === 0) {
        console.log(`Aucune déclaration fiscale trouvée pour l'année ${annee}`);

        // Récupérer les années pour lesquelles des données existent
        const anneesDisponibles = await this.getAnneesDisponibles();

        // Ne pas ajouter automatiquement 2025 - nous utilisons les années réelles des déclarations
        anneesDisponibles.sort();

        // Renvoyer un objet indiquant qu'aucune donnée n'est disponible
        return {
          annee,
          dataAvailable: false,
          anneesDisponibles
        };
      }

      // Récupérer les données fiscales pour l'année
      console.log(`Récupération des données fiscales pour l'année ${annee}`);

      // Au lieu d'appeler les services externes, calculer les totaux à partir des déclarations
      console.log(`Calcul des totaux à partir des ${declarations.length} déclarations fiscales`);

      // Initialiser les totaux
      let totalTVACollectee = 0;
      let totalTVADeductible = 0;
      let totalTCL = 0;
      let totalDroitTimbre = 0;

      // Calculer les totaux à partir des déclarations
      for (const declaration of declarations) {
        // Ajouter la TVA due (qui est la TVA collectée moins la TVA déductible)
        const tvaDue = declaration.totalTVADue || 0;
        totalTVACollectee += tvaDue; // Simplification: on considère que la TVA due est la TVA collectée

        // Ajouter la TCL
        totalTCL += declaration.totalTCL || 0;

        // Ajouter le droit de timbre
        totalDroitTimbre += declaration.totalDroitTimbre || 0;
      }

      // Créer les objets de bilan
      const bilanTVA = {
        totalTVACollectee,
        totalTVADeductible: 0, // Nous n'avons pas cette information dans les déclarations
        soldeTVA: totalTVACollectee // Simplification: soldeTVA = totalTVACollectee car totalTVADeductible = 0
      };
      console.log('Bilan TVA calculé:', bilanTVA);

      const bilanTCL = {
        montantTCL: totalTCL
      };
      console.log('Bilan TCL calculé:', bilanTCL);

      const bilanDroitTimbre = {
        totalDroitTimbre
      };
      console.log('Bilan Droit de Timbre calculé:', bilanDroitTimbre);

      // Calculer les indicateurs par période (mensuel ou trimestriel)
      const indicateursMensuels = await this.calculerIndicateursMensuels(annee);

      // Construire le dashboard
      const dashboard = {
        annee,
        dataAvailable: true,
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
        declarations: declarations.map(d => {
          // Extraire les dates de début et de fin à partir de la chaîne de période
          let debut = '', fin = '';
          if (d.periode) {
            const parts = d.periode.split(' - ');
            if (parts.length === 2) {
              debut = parts[0];
              fin = parts[1];
            }
          }

          return {
            id: d._id,
            periode: d.periode,
            periodeDebut: debut,
            periodeFin: fin,
            type: d.type,
            statut: d.statut,
            tvaDue: d.totalTVADue || 0,
            tcl: d.totalTCL || 0,
            droitTimbre: d.totalDroitTimbre || 0,
            totalAPayer:
              ((d.totalTVADue > 0 ? d.totalTVADue : 0) || 0) +
              (d.totalTCL || 0) +
              (d.totalDroitTimbre || 0),
            dateCreation: d.dateCreation,
            dateSoumission: d.dateSoumission
          };
        }),
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
    console.log(`Calcul des indicateurs mensuels pour l'année ${annee}`);

    // Récupérer toutes les déclarations fiscales de l'année
    const anneeStr = annee.toString();
    const declarations = await DeclarationFiscale.find({
      'periode': { $regex: anneeStr }
    });
    console.log(`Trouvé ${declarations.length} déclarations pour l'année ${annee}`);

    // Initialiser les indicateurs pour chaque mois
    for (let mois = 0; mois < 12; mois++) {
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

    // Parcourir les déclarations et ajouter les montants aux mois correspondants
    for (const declaration of declarations) {
      try {
        // Extraire le mois à partir de la période
        let mois = 0;
        if (declaration.periode) {
          // Essayer d'extraire le mois de début
          const match = declaration.periode.match(/^\d{4}-(\d{2})-\d{2}/);
          if (match && match[1]) {
            mois = parseInt(match[1]) - 1; // Les mois sont indexés à partir de 0
            console.log(`Déclaration pour le mois ${mois + 1} (${declaration.periode})`);
          }
        }

        // Vérifier que le mois est valide
        if (mois >= 0 && mois < 12) {
          // Ajouter les montants au mois correspondant
          indicateurs[mois].tvaCollectee += declaration.totalTVADue || 0;
          indicateurs[mois].soldeTVA += declaration.totalTVADue || 0;
          indicateurs[mois].tcl += declaration.totalTCL || 0;
          indicateurs[mois].droitTimbre += declaration.totalDroitTimbre || 0;

          // Calculer le total des charges fiscales
          indicateurs[mois].totalChargesFiscales =
            (indicateurs[mois].soldeTVA > 0 ? indicateurs[mois].soldeTVA : 0) +
            indicateurs[mois].tcl +
            indicateurs[mois].droitTimbre;

          console.log(`Ajouté au mois ${mois + 1}: TVA=${declaration.totalTVADue}, TCL=${declaration.totalTCL}, DT=${declaration.totalDroitTimbre}`);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de la déclaration:`, error);
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

  /**
   * Récupère les années pour lesquelles des données fiscales sont disponibles
   * @return {Array} Liste des années disponibles
   */
  static async getAnneesDisponibles() {
    try {
      // Récupérer toutes les déclarations fiscales
      const declarations = await DeclarationFiscale.find({}, 'periode');
      console.log(`Total des déclarations trouvées: ${declarations.length}`);

      // Extraire les années uniques en utilisant une approche plus robuste
      const annees = new Set();

      declarations.forEach(d => {
        if (d.periode) {
          try {
            // Extraire toutes les années présentes dans la chaîne de période
            const periodeStr = d.periode.toString();
            const matches = periodeStr.match(/\b(20\d{2})\b/g); // Recherche toutes les années au format 20XX

            if (matches && matches.length > 0) {
              matches.forEach(match => {
                const annee = parseInt(match);
                annees.add(annee);
                console.log(`Année extraite de la période: ${annee}`);
              });
            }
          } catch (err) {
            console.error('Erreur lors de l\'extraction des années de la période:', err);
          }
        }
      });

      // Convertir en tableau
      let anneesArray = Array.from(annees);
      console.log('Années trouvées dans les déclarations:', anneesArray);

      // Ajouter l'année courante si elle n'est pas déjà présente
      const currentYear = new Date().getFullYear();
      if (!anneesArray.includes(currentYear)) {
        anneesArray.push(currentYear);
        console.log(`Ajout de l'année courante ${currentYear} à la liste des années disponibles`);
      }

      // Trier les années
      anneesArray.sort();
      console.log('Années disponibles après traitement:', anneesArray);

      return anneesArray;
    } catch (error) {
      console.error('Erreur lors de la récupération des années disponibles:', error);
      return [];
    }
  }
}

module.exports = DashboardFiscalService;