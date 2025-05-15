// Backend/services/SimulationFiscaleService.js
const TVAService = require('./TVAService');
const TCLService = require('./TCLService');
const DroitTimbreService = require('./DroitTimbreService');

class SimulationFiscaleService {
  /**
   * Simule l'impact fiscal d'un changement de volume d'activité
   * @param {Object} parametres - Paramètres de simulation
   * @return {Object} Résultats de la simulation
   */
  static simulerChangementVolumeActivite(parametres) {
    const {
      chiffreAffairesActuel,
      tauxCroissance,
      tauxTVAMoyen,
      tauxTVADeductibleMoyen,
      proportionAchats
    } = parametres;
    
    // Calculer le nouveau chiffre d'affaires
    const nouveauCA = chiffreAffairesActuel * (1 + (tauxCroissance / 100));
    
    // Calculer les achats (actuels et nouveaux)
    const achatsActuels = chiffreAffairesActuel * (proportionAchats / 100);
    const nouveauxAchats = nouveauCA * (proportionAchats / 100);
    
    // Calculer la TVA collectée
    const tvaCollecteeActuelle = chiffreAffairesActuel * (tauxTVAMoyen / 100);
    const nouvelleTVACollectee = nouveauCA * (tauxTVAMoyen / 100);
    
    // Calculer la TVA déductible
    const tvaDeductibleActuelle = achatsActuels * (tauxTVADeductibleMoyen / 100);
    const nouvelleTVADeductible = nouveauxAchats * (tauxTVADeductibleMoyen / 100);
    
    // Calculer la TVA à payer
    const tvaPayerActuelle = tvaCollecteeActuelle - tvaDeductibleActuelle;
    const nouvelleTVAPayer = nouvelleTVACollectee - nouvelleTVADeductible;
    
    // Calculer la TCL
    const tclActuelle = chiffreAffairesActuel * (0.2 / 100);
    const nouvelleTCL = nouveauCA * (0.2 / 100);
    
    // Calculer les charges fiscales totales
    const chargesFiscalesActuelles = tvaPayerActuelle + tclActuelle;
    const nouvellesChargesFiscales = nouvelleTVAPayer + nouvelleTCL;
        // Calculer l'impact
        const impactTVA = nouvelleTVAPayer - tvaPayerActuelle;
        const impactTCL = nouvelleTCL - tclActuelle;
        const impactTotal = nouvellesChargesFiscales - chargesFiscalesActuelles;
        
        return {
          donneesSituation: {
            actuelle: {
              chiffreAffaires: chiffreAffairesActuel,
              achats: achatsActuels,
              tvaCollectee: tvaCollecteeActuelle,
              tvaDeductible: tvaDeductibleActuelle,
              tvaPayer: tvaPayerActuelle,
              tcl: tclActuelle,
              chargesFiscalesTotales: chargesFiscalesActuelles
            },
            nouvelle: {
              chiffreAffaires: nouveauCA,
              achats: nouveauxAchats,
              tvaCollectee: nouvelleTVACollectee,
              tvaDeductible: nouvelleTVADeductible,
              tvaPayer: nouvelleTVAPayer,
              tcl: nouvelleTCL,
              chargesFiscalesTotales: nouvellesChargesFiscales
            }
          },
          impact: {
            chiffreAffaires: nouveauCA - chiffreAffairesActuel,
            tva: impactTVA,
            tcl: impactTCL,
            total: impactTotal,
            pourcentageTotal: (impactTotal / chargesFiscalesActuelles) * 100
          },
          recommandations: this.genererRecommandationsSimulation(impactTotal, tauxCroissance, nouvelleTVAPayer, nouvelleTCL)
        };
      }
      
      /**
       * Génère des recommandations basées sur les résultats de la simulation
       * @param {Number} impactTotal - Impact fiscal total
       * @param {Number} tauxCroissance - Taux de croissance du CA
       * @param {Number} nouvelleTVAPayer - Nouvelle TVA à payer
       * @param {Number} nouvelleTCL - Nouvelle TCL à payer
       * @return {Array} Recommandations
       */
      static genererRecommandationsSimulation(impactTotal, tauxCroissance, nouvelleTVAPayer, nouvelleTCL) {
        const recommandations = [];
        
        // Recommandations générales
        if (impactTotal > 0) {
          recommandations.push({
            titre: "Augmentation des charges fiscales",
            description: `L'augmentation du volume d'activité de ${tauxCroissance}% entraîne une hausse des charges fiscales de ${impactTotal.toFixed(2)} DT.`,
            importance: "moyenne"
          });
          
          // Recommandations spécifiques si l'impact est significatif
          if (impactTotal > 5000) {
            recommandations.push({
              titre: "Planification fiscale recommandée",
              description: "L'impact fiscal est significatif. Envisagez une planification fiscale pour optimiser votre situation.",
              importance: "haute"
            });
          }
        } else {
          recommandations.push({
            titre: "Réduction des charges fiscales",
            description: `L'ajustement du volume d'activité entraîne une réduction des charges fiscales de ${Math.abs(impactTotal).toFixed(2)} DT.`,
            importance: "basse"
          });
        }
        
        // Recommandations spécifiques à la TVA
        if (nouvelleTVAPayer > 10000) {
          recommandations.push({
            titre: "Optimisation de la TVA",
            description: "Le montant de TVA à payer est important. Vérifiez que toutes vos TVA déductibles sont bien prises en compte.",
            importance: "moyenne"
          });
        }
        
        // Recommandations spécifiques à la TCL
        if (nouvelleTCL > 5000) {
          recommandations.push({
            titre: "Impact TCL significatif",
            description: "La TCL représente une charge fiscale importante. Vérifiez si certaines de vos activités sont éligibles à des exonérations.",
            importance: "moyenne"
          });
        }
        
        return recommandations;
      }
      
      /**
       * Simule l'impact fiscal d'un changement de régime d'imposition
       * @param {Object} parametres - Paramètres de simulation
       * @return {Object} Résultats de la simulation
       */
      static simulerChangementRegimeImposition(parametres) {
        const {
          chiffreAffaires,
          regimeActuel,
          regimeCible,
          beneficeNet,
          tauxTVAMoyen,
          proportionAchats
        } = parametres;
        
        // Calculer les montants d'impôt pour chaque régime
        let impotRegimeActuel = 0;
        let impotRegimeCible = 0;
        let tvaRegimeActuel = 0;
        let tvaRegimeCible = 0;
        
        // Calcul pour le régime réel (impôt sur les sociétés)
        const calculImpotReel = () => {
          // Taux d'IS en Tunisie: 15% pour certains secteurs, 25% standard
          const tauxIS = 0.25;
          return beneficeNet * tauxIS;
        };
        
        // Calcul pour le régime forfaitaire
        const calculImpotForfaitaire = () => {
          // En Tunisie, le taux forfaitaire est généralement entre 2% et 3% du CA
          const tauxForfaitaire = 0.03;
          return chiffreAffaires * tauxForfaitaire;
        };
        
        // Calcul pour le régime de la micro-entreprise
        const calculImpotMicroEntreprise = () => {
          // Hypothèse: taux fixe de 2% du CA
          const tauxMicro = 0.02;
          return chiffreAffaires * tauxMicro;
        };
        
        // Calcul de la TVA pour le régime réel
        const calculTVAReel = () => {
          const tvaCollectee = chiffreAffaires * (tauxTVAMoyen / 100);
          const achats = chiffreAffaires * (proportionAchats / 100);
          const tvaDeductible = achats * (tauxTVAMoyen / 100);
          return tvaCollectee - tvaDeductible;
        };
        
        // Calcul de la TVA pour les régimes simplifiés
        const calculTVAForfaitaire = () => {
          // Les forfaitaires ont souvent des règles simplifiées pour la TVA
          return 0; // Souvent exonérés de TVA ou TVA très simplifiée
        };
        
        // Déterminer l'impôt pour le régime actuel
        switch (regimeActuel) {
          case 'reel':
            impotRegimeActuel = calculImpotReel();
            tvaRegimeActuel = calculTVAReel();
            break;
          case 'forfaitaire':
            impotRegimeActuel = calculImpotForfaitaire();
            tvaRegimeActuel = calculTVAForfaitaire();
            break;
          case 'micro':
            impotRegimeActuel = calculImpotMicroEntreprise();
            tvaRegimeActuel = calculTVAForfaitaire();
            break;
        }
        
        // Déterminer l'impôt pour le régime cible
        switch (regimeCible) {
          case 'reel':
            impotRegimeCible = calculImpotReel();
            tvaRegimeCible = calculTVAReel();
            break;
          case 'forfaitaire':
            impotRegimeCible = calculImpotForfaitaire();
            tvaRegimeCible = calculTVAForfaitaire();
            break;
          case 'micro':
            impotRegimeCible = calculImpotMicroEntreprise();
            tvaRegimeCible = calculTVAForfaitaire();
            break;
        }
        
        // Calculer l'impact total
        const impactImpot = impotRegimeCible - impotRegimeActuel;
        const impactTVA = tvaRegimeCible - tvaRegimeActuel;
        const impactTotal = impactImpot + impactTVA;
        
        return {
          donneesSituation: {
            actuelle: {
              regime: regimeActuel,
              impot: impotRegimeActuel,
              tva: tvaRegimeActuel,
              chargesFiscalesTotales: impotRegimeActuel + tvaRegimeActuel
            },
            nouvelle: {
              regime: regimeCible,
              impot: impotRegimeCible,
              tva: tvaRegimeCible,
              chargesFiscalesTotales: impotRegimeCible + tvaRegimeCible
            }
          },
          impact: {
            impot: impactImpot,
            tva: impactTVA,
            total: impactTotal,
            pourcentageTotal: ((impactTotal) / (impotRegimeActuel + tvaRegimeActuel)) * 100
          },
          recommandations: this.genererRecommandationsChangementRegime(regimeActuel, regimeCible, impactTotal)
        };
      }
      
      /**
       * Génère des recommandations pour un changement de régime fiscal
       * @param {String} regimeActuel - Régime fiscal actuel
       * @param {String} regimeCible - Régime fiscal cible
       * @param {Number} impactTotal - Impact fiscal total
       * @return {Array} Recommandations
       */
      static genererRecommandationsChangementRegime(regimeActuel, regimeCible, impactTotal) {
        const recommandations = [];
        
        // Noms complets des régimes pour une meilleure lisibilité
        const nomsRegimes = {
          'reel': 'Régime Réel',
          'forfaitaire': 'Régime Forfaitaire',
          'micro': 'Régime Micro-Entreprise'
        };
        
        // Recommandation générale
        if (impactTotal < 0) {
          recommandations.push({
            titre: "Changement de régime avantageux",
            description: `Le passage du ${nomsRegimes[regimeActuel]} au ${nomsRegimes[regimeCible]} pourrait vous faire économiser environ ${Math.abs(impactTotal).toFixed(2)} DT en charges fiscales.`,
            importance: "haute"
          });
        } else if (impactTotal > 0) {
          recommandations.push({
            titre: "Changement de régime désavantageux",
            description: `Le passage du ${nomsRegimes[regimeActuel]} au ${nomsRegimes[regimeCible]} augmenterait vos charges fiscales d'environ ${impactTotal.toFixed(2)} DT.`,
            importance: "haute"
          });
        } else {
          recommandations.push({
            titre: "Impact fiscal neutre",
            description: `Le changement de régime n'aurait pas d'impact significatif sur vos charges fiscales.`,
            importance: "moyenne"
          });
        }
        
        // Recommandations spécifiques selon les régimes
        if (regimeCible === 'forfaitaire') {
          recommandations.push({
            titre: "Simplification administrative",
            description: "Le régime forfaitaire simplifie considérablement vos obligations comptables et déclaratives.",
            importance: "moyenne"
          });
          
          recommandations.push({
            titre: "Vérification des seuils d'éligibilité",
            description: "Assurez-vous que votre chiffre d'affaires reste sous le seuil autorisé pour le régime forfaitaire.",
            importance: "haute"
          });
        }
        
        if (regimeCible === 'reel') {
          recommandations.push({
            titre: "Obligations comptables étendues",
            description: "Le régime réel nécessite une comptabilité complète et des déclarations plus détaillées.",
            importance: "moyenne"
          });
          
          recommandations.push({
            titre: "Optimisation des charges déductibles",
            description: "Assurez-vous de bien identifier toutes vos charges déductibles pour optimiser votre situation fiscale.",
            importance: "haute"
          });
        }
        
        return recommandations;
      }
      
      /**
       * Simule l'impact fiscal d'un investissement
       * @param {Object} parametres - Paramètres de simulation
       * @return {Object} Résultats de la simulation
       */
      static simulerImpactInvestissement(parametres) {
        const {
          montantInvestissement,
          dureeAmortissement,
          tauxInteretEmprunt,
          pourcentageEmprunt,
          augmentationCAAttendue,
          tauxIS,
          tauxTVA
        } = parametres;
        
        // Calculer les montants de l'emprunt et de l'autofinancement
        const montantEmprunt = montantInvestissement * (pourcentageEmprunt / 100);
        const montantAutofinancement = montantInvestissement - montantEmprunt;
        
        // Calculer l'amortissement annuel
        const amortissementAnnuel = montantInvestissement / dureeAmortissement;
        
        // Calculer les intérêts annuels (simplifiés)
        const interetsAnnuels = montantEmprunt * (tauxInteretEmprunt / 100);
        
        // Calculer l'augmentation du bénéfice avant impôt
        const augmentationBAI = augmentationCAAttendue - amortissementAnnuel - interetsAnnuels;
        
        // Calculer l'impact sur l'impôt sur les sociétés
        const impactIS = augmentationBAI * (tauxIS / 100);
        
        // Calculer la TVA récupérable sur l'investissement
        const tvaRecuperable = montantInvestissement * (tauxTVA / 100);
        
        // Calculer le retour sur investissement
        const retourInvestissementAnnuel = augmentationCAAttendue - interetsAnnuels - impactIS;
        const delaiRetourInvestissement = montantInvestissement / retourInvestissementAnnuel;
        
        return {
          investissement: {
            montantTotal: montantInvestissement,
            montantEmprunt,
            montantAutofinancement,
            amortissementAnnuel,
            interetsAnnuels
          },
          impactAnnuel: {
            augmentationCA: augmentationCAAttendue,
            augmentationBAI,
            impactIS,
            retourInvestissementAnnuel
          },
          impactTresorerie: {
            tvaRecuperable,
            delaiRecuperationTVA: "1 à 3 mois", // Délai moyen en Tunisie
            delaiRetourInvestissement: delaiRetourInvestissement.toFixed(2) + " ans"
          },
          recommandations: this.genererRecommandationsInvestissement(montantInvestissement, tvaRecuperable, delaiRetourInvestissement, augmentationBAI)
        };
      }
      
      /**
       * Génère des recommandations pour un investissement
       * @param {Number} montantInvestissement - Montant de l'investissement
       * @param {Number} tvaRecuperable - TVA récupérable
       * @param {Number} delaiRetourInvestissement - Délai de retour sur investissement
       * @param {Number} augmentationBAI - Augmentation du bénéfice avant impôt
       * @return {Array} Recommandations
       */
      static genererRecommandationsInvestissement(montantInvestissement, tvaRecuperable, delaiRetourInvestissement, augmentationBAI) {
        const recommandations = [];
        
        // Recommandation sur la TVA
        recommandations.push({
          titre: "Récupération de TVA",
          description: `Prévoyez de récupérer environ ${tvaRecuperable.toFixed(2)} DT de TVA sur votre investissement. Assurez-vous de conserver toutes les factures.`,
          importance: "haute"
        });
        
        // Recommandation sur le retour sur investissement
        if (delaiRetourInvestissement < 3) {
          recommandations.push({
            titre: "Retour sur investissement rapide",
            description: `Avec un délai de retour sur investissement estimé à ${delaiRetourInvestissement.toFixed(2)} ans, cet investissement semble très rentable.`,
            importance: "haute"
          });
        } else if (delaiRetourInvestissement < 5) {
          recommandations.push({
            titre: "Retour sur investissement moyen",
            description: `Avec un délai de retour sur investissement estimé à ${delaiRetourInvestissement.toFixed(2)} ans, cet investissement présente une rentabilité moyenne.`,
            importance: "moyenne"
          });
        } else {
          recommandations.push({
            titre: "Retour sur investissement long",
            description: `Avec un délai de retour sur investissement estimé à ${delaiRetourInvestissement.toFixed(2)} ans, envisagez de revoir la structure ou le montant de cet investissement.`,
            importance: "haute"
          });
        }
        
        // Recommandation sur l'impact fiscal
        if (augmentationBAI > 0) {
          recommandations.push({
            titre: "Impact positif sur le résultat",
            description: "Cet investissement devrait améliorer votre résultat fiscal. Prévoyez une augmentation de l'impôt sur les sociétés en conséquence.",
            importance: "moyenne"
          });
        } else {
          recommandations.push({
            titre: "Impact négatif initial sur le résultat",
            description: "Cet investissement pourrait réduire temporairement votre résultat fiscal, ce qui pourrait diminuer votre charge d'impôt à court terme.",
            importance: "moyenne"
          });
        }
        
        // Recommandation sur les aides fiscales
        if (montantInvestissement > 50000) {
          recommandations.push({
            titre: "Avantages fiscaux potentiels",
            description: "Vérifiez si cet investissement est éligible à des avantages fiscaux spécifiques (déductions, subventions, crédits d'impôt) prévus par le code des investissements tunisien.",
            importance: "haute"
          });
        }
        
        return recommandations;
      }
    }
    
    module.exports = SimulationFiscaleService;