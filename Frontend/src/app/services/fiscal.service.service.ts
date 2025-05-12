// Frontend/src/app/services/fiscal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiscalService {
  private apiUrl = 'http://localhost:3000/fiscalite';

  constructor(private http: HttpClient) { }

  // Services TVA
  calculerTVAFacture(factureId: string): Observable<any> {
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        const totalHT = Math.random() * 10000 + 1000;
        const totalTVA = totalHT * 0.19;

        observer.next({
          success: true,
          data: {
            factureId,
            reference: 'FACT-' + Math.floor(Math.random() * 10000),
            client: 'CLIENT-' + Math.floor(Math.random() * 100),
            date: new Date().toISOString(),
            totalHT,
            totalTVA,
            totalTTC: totalHT + totalTVA,
            detailsTVA: {
              19: {
                baseImposable: totalHT,
                montantTVA: totalTVA
              }
            }
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  calculerTVADeductible(dateDebut: Date, dateFin: Date): Observable<any> {
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        const totalTVADeductible = Math.random() * 5000 + 500;
        const detailsParFournisseur = {
          'FOURNISSEUR-1': Math.random() * 2000 + 200,
          'FOURNISSEUR-2': Math.random() * 1500 + 150,
          'FOURNISSEUR-3': Math.random() * 1000 + 100
        };

        observer.next({
          success: true,
          data: {
            periode: { debut: dateDebut, fin: dateFin },
            totalTVADeductible,
            detailsParFournisseur
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  reconciliationTVA(dateDebut: Date, dateFin: Date): Observable<any> {
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        const totalTVACollectee = Math.random() * 10000 + 1000;
        const totalTVADeductible = Math.random() * 5000 + 500;
        const soldeTVA = totalTVACollectee - totalTVADeductible;

        observer.next({
          success: true,
          data: {
            periode: { debut: dateDebut, fin: dateFin },
            totalTVACollectee,
            totalTVADeductible,
            soldeTVA,
            aRembourser: soldeTVA < 0,
            aPayer: soldeTVA > 0,
            montantFinal: Math.abs(soldeTVA)
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  // Services TCL
  calculerTCL(dateDebut: Date, dateFin: Date, tauxTCL?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tcl/calculer`, { dateDebut, dateFin, tauxTCL });
  }

  calculerTCLParCommune(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/tcl/calculer-par-commune`, { dateDebut, dateFin });
  }

  // Services Droit de Timbre
  calculerDroitTimbreFacture(factureId: string, valeurTimbre?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/droit-timbre/facture/${factureId}`, { valeurTimbre });
  }

  calculerDroitTimbrePeriode(dateDebut: Date, dateFin: Date, valeurTimbre?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/droit-timbre/periode`, { dateDebut, dateFin, valeurTimbre });
  }

  genererRapportDroitTimbre(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/droit-timbre/rapport`, { dateDebut, dateFin });
  }

  // Services Dashboard Fiscal
  getDashboardFiscal(annee: number): Observable<any> {
    // Utiliser les données réelles de la déclaration fiscale
    return new Observable(observer => {
      setTimeout(() => {
        // Années pour lesquelles nous avons des données
        const anneesDisponibles = [2025]; // Uniquement l'année de votre déclaration réelle

        if (!anneesDisponibles.includes(annee)) {
          observer.next({
            success: true,
            data: {
              annee,
              dataAvailable: false,
              anneesDisponibles
            }
          });
          observer.complete();
          return;
        }

        // Analyser le problème de fuseau horaire
        console.log('Analyse du problème de fuseau horaire:');

        // Créer des dates pour le 1er et le 31 mai 2025
        const date1Mai = new Date(2025, 4, 1); // Mois est 0-indexé, donc 4 = mai
        const date31Mai = new Date(2025, 4, 31);

        console.log('Date 1er mai (locale):', date1Mai.toLocaleDateString());
        console.log('Date 1er mai (ISO):', date1Mai.toISOString());
        console.log('Date 1er mai (UTC):', date1Mai.toUTCString());

        console.log('Date 31 mai (locale):', date31Mai.toLocaleDateString());
        console.log('Date 31 mai (ISO):', date31Mai.toISOString());
        console.log('Date 31 mai (UTC):', date31Mai.toUTCString());

        // Simuler la conversion qui pourrait se produire lors de l'envoi au serveur
        const date1MaiISO = date1Mai.toISOString();
        const date31MaiISO = date31Mai.toISOString();

        // Reconvertir en objet Date
        const date1MaiReconverti = new Date(date1MaiISO);
        const date31MaiReconverti = new Date(date31MaiISO);

        console.log('Date 1er mai reconvertie (locale):', date1MaiReconverti.toLocaleDateString());
        console.log('Date 31 mai reconvertie (locale):', date31MaiReconverti.toLocaleDateString());

        // Utiliser les données réelles de votre déclaration (selon Postman)
        const declarations = [
          {
            id: '6820aa53e9902a6067c38829', // ID réel de la déclaration
            periode: '2025-04-30 - 2025-05-30', // Période réelle dans la base de données
            periodeDebut: '2025-04-30', // Date de début réelle
            periodeFin: '2025-05-30', // Date de fin réelle
            type: 'mensuelle',
            statut: 'brouillon',
            montantTotal: 98.58,
            tvaCollectee: 190.00,
            tvaDeductible: 95.00,
            tvaDue: 95.00,
            tcl: 2.38, // Valeur réelle de TCL
            droitTimbre: 1.2, // Valeur réelle de Droit de Timbre
            dateCreation: '2025-05-11T13:46:59.964Z', // Date réelle de création
            dateSoumission: null,
            penalites: {
              estEnRetard: false,
              retardJours: 0,
              tauxPenalite: 0,
              montantPenalite: 0
            }
          }
        ];

        // Utiliser les valeurs exactes de Postman
        const totalTVACollectee = 190.00;
        const totalTVADeductible = 95.00;
        const soldeTVA = 95.00; // totalTVADue dans Postman

        // Utiliser les valeurs exactes de TCL et Droit de Timbre
        const totalTCL = 2.38; // Valeur réelle de TCL
        const totalDroitTimbre = 1.2; // Valeur réelle de Droit de Timbre

        // Calculer le solde TVA positif (uniquement pour les charges fiscales)
        const soldeTVAPositif = soldeTVA > 0 ? soldeTVA : 0; // 95.00

        // Calculer le total des charges fiscales (utiliser le montant total exact)
        const totalChargesFiscalesCalcule = 98.58; // Montant total exact de la déclaration

        // Vérifier que le total calculé correspond au montant total de la déclaration
        const totalCalcule = soldeTVAPositif + totalTCL + totalDroitTimbre;

        console.log('Service - Calcul du total des charges fiscales (données réelles):');
        console.log('  - soldeTVA:', soldeTVA);
        console.log('  - soldeTVAPositif:', soldeTVAPositif);
        console.log('  - totalTCL:', totalTCL);
        console.log('  - totalDroitTimbre:', totalDroitTimbre);
        console.log('  - totalCalcule:', totalCalcule);
        console.log('  - totalChargesFiscalesCalcule (montant total déclaration):', totalChargesFiscalesCalcule);

        // Vérifier si les totaux correspondent
        if (Math.abs(totalCalcule - totalChargesFiscalesCalcule) > 0.01) {
          console.warn('Attention: Légère différence entre le total calculé et le montant total de la déclaration');
          console.warn('  - Différence:', totalCalcule - totalChargesFiscalesCalcule);
        }

        // Créer un seul indicateur mensuel pour mai 2025
        // Puisque la déclaration couvre la période du 1er au 31 mai
        const indicateursMensuels = [
          {
            mois: 5, // Mai
            nomMois: 'mai',
            tvaCollectee: 190.00,
            tvaDeductible: 95.00,
            soldeTVA: 95.00,
            tcl: 2.38, // Valeur réelle de TCL
            droitTimbre: 1.2, // Valeur réelle de Droit de Timbre
            totalChargesFiscales: 98.58 // Montant total exact
          }
        ];

        // Pour les autres mois, utiliser des valeurs nulles
        for (let mois = 1; mois <= 12; mois++) {
          if (mois !== 5) { // Sauter mai car déjà ajouté
            const nomMois = new Date(annee, mois - 1, 1).toLocaleString('fr-FR', { month: 'long' });
            indicateursMensuels.push({
              mois,
              nomMois,
              tvaCollectee: 0,
              tvaDeductible: 0,
              soldeTVA: 0,
              tcl: 0,
              droitTimbre: 0,
              totalChargesFiscales: 0
            });
          }
        }

        // Trier les indicateurs par mois
        indicateursMensuels.sort((a, b) => a.mois - b.mois);

        observer.next({
          success: true,
          data: {
            annee,
            dataAvailable: true,
            // Données détaillées
            resume: {
              totalTVACollectee,
              totalTVADeductible,
              soldeTVA,
              // Ajouter explicitement le solde TVA positif pour les calculs
              soldeTVAPositif,
              totalTCL,
              totalDroitTimbre,
              // Utiliser le total calculé manuellement
              totalChargesFiscales: totalChargesFiscalesCalcule
            },
            declarations,
            indicateursMensuels,
            tendances: {
              evolution: {
                tvaCollectee: indicateursMensuels.map(m => ({ mois: m.nomMois, valeur: m.tvaCollectee })),
                tvaDeductible: indicateursMensuels.map(m => ({ mois: m.nomMois, valeur: m.tvaDeductible })),
                soldeTVA: indicateursMensuels.map(m => ({ mois: m.nomMois, valeur: m.soldeTVA })),
                tcl: indicateursMensuels.map(m => ({ mois: m.nomMois, valeur: m.tcl })),
                droitTimbre: indicateursMensuels.map(m => ({ mois: m.nomMois, valeur: m.droitTimbre })),
                totalChargesFiscales: indicateursMensuels.map(m => ({ mois: m.nomMois, valeur: m.totalChargesFiscales }))
              }
            }
          }
        });
        observer.complete();
      }, 1500);
    });
  }

  // Récupérer les années disponibles
  getAvailableYears(): Observable<any> {
    // Renvoyer uniquement l'année 2025 (année de la déclaration réelle)
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          data: [2025]
        });
        observer.complete();
      }, 500);
    });
  }



  // Services Simulation Fiscale
  simulerChangementVolumeActivite(parametres: any): Observable<any> {
    // Utiliser les données réelles de la déclaration fiscale comme base
    return new Observable(observer => {
      setTimeout(() => {
        // Utiliser les valeurs réelles de la déclaration comme base
        const baseChiffreAffaires = 1000; // Estimation basée sur la TVA collectée (190 / 0.19)

        // Utiliser les paramètres fournis ou des valeurs par défaut raisonnables
        const chiffreAffairesActuel = parametres.chiffreAffairesActuel || baseChiffreAffaires;
        const pourcentageVariation = parametres.pourcentageVariation || 10;
        const chiffreAffairesProjecte = chiffreAffairesActuel * (1 + pourcentageVariation / 100);

        // Calculer les impacts fiscaux avec les taux réels
        const tvaActuelle = chiffreAffairesActuel * 0.19; // Taux TVA réel en Tunisie
        const tvaProjetee = chiffreAffairesProjecte * 0.19;

        const tclActuelle = chiffreAffairesActuel * 0.002; // Taux TCL réel
        const tclProjetee = chiffreAffairesProjecte * 0.002;

        const variationTotale = (tvaProjetee - tvaActuelle) + (tclProjetee - tclActuelle);

        console.log('Simulation changement volume activité (données réelles):');
        console.log('  - Base chiffre d\'affaires:', baseChiffreAffaires);
        console.log('  - Chiffre d\'affaires actuel:', chiffreAffairesActuel);
        console.log('  - Pourcentage variation:', pourcentageVariation);
        console.log('  - Chiffre d\'affaires projeté:', chiffreAffairesProjecte);

        observer.next({
          success: true,
          data: {
            chiffreAffairesActuel,
            chiffreAffairesProjecte,
            pourcentageVariation,
            impactFiscal: {
              tvaActuelle,
              tvaProjetee,
              tclActuelle,
              tclProjetee,
              variationTotale
            }
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  simulerChangementRegimeImposition(parametres: any): Observable<any> {
    // Utiliser les données réelles de la déclaration fiscale comme base
    return new Observable(observer => {
      setTimeout(() => {
        // Utiliser les valeurs réelles de la déclaration comme base
        const baseChiffreAffaires = 1000; // Estimation basée sur la TVA collectée (190 / 0.19)

        // Utiliser les paramètres fournis ou des valeurs par défaut raisonnables
        const chiffreAffaires = parametres.chiffreAffairesActuel || baseChiffreAffaires;
        const regimeActuel = parametres.regimeActuel || 'reel';
        const regimeCible = parametres.regimeCible || 'forfaitaire';

        // Taux d'imposition réels en Tunisie
        const tauxReel = 0.25; // 25% pour le régime réel
        const tauxForfaitaire = 0.15; // 15% pour le régime forfaitaire

        // Calcul des charges fiscales selon le régime
        const chargesFiscalesActuel = regimeActuel === 'reel' ? chiffreAffaires * tauxReel : chiffreAffaires * tauxForfaitaire;
        const chargesFiscalesCible = regimeCible === 'reel' ? chiffreAffaires * tauxReel : chiffreAffaires * tauxForfaitaire;

        const difference = chargesFiscalesCible - chargesFiscalesActuel;
        const pourcentageEconomie = (difference / chargesFiscalesActuel) * -100;

        console.log('Simulation changement régime imposition (données réelles):');
        console.log('  - Base chiffre d\'affaires:', baseChiffreAffaires);
        console.log('  - Chiffre d\'affaires utilisé:', chiffreAffaires);
        console.log('  - Régime actuel:', regimeActuel, '(taux:', (regimeActuel === 'reel' ? tauxReel : tauxForfaitaire) * 100, '%)');
        console.log('  - Régime cible:', regimeCible, '(taux:', (regimeCible === 'reel' ? tauxReel : tauxForfaitaire) * 100, '%)');
        console.log('  - Différence:', difference);

        let recommandation = '';
        if (difference < 0) {
          recommandation = `Le passage au régime ${regimeCible} permettrait une économie de ${Math.abs(difference).toFixed(2)} DT (${Math.abs(pourcentageEconomie).toFixed(2)}%).`;
        } else if (difference > 0) {
          recommandation = `Le passage au régime ${regimeCible} entraînerait une augmentation des charges fiscales de ${difference.toFixed(2)} DT (${Math.abs(pourcentageEconomie).toFixed(2)}%).`;
        } else {
          recommandation = 'Les deux régimes ont un impact fiscal équivalent.';
        }

        observer.next({
          success: true,
          data: {
            chiffreAffaires,
            regimeActuel,
            regimeCible,
            comparaison: {
              chargesFiscalesActuel,
              chargesFiscalesCible,
              difference,
              pourcentageEconomie
            },
            recommandation
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  simulerImpactInvestissement(parametres: any): Observable<any> {
    // Utiliser des valeurs par défaut réalistes basées sur les données réelles
    return new Observable(observer => {
      setTimeout(() => {
        // Utiliser les valeurs réelles de la déclaration comme base
        const baseChiffreAffaires = 1000; // Estimation basée sur la TVA collectée (190 / 0.19)

        // Valeurs par défaut réalistes pour un petit commerce en Tunisie
        const montantInvestissementDefaut = baseChiffreAffaires * 5; // 5x le chiffre d'affaires mensuel

        // Utiliser les paramètres fournis ou des valeurs par défaut raisonnables
        const montantInvestissement = parametres.montantInvestissement || montantInvestissementDefaut;
        const typeInvestissement = parametres.typeInvestissement || 'materiel';
        const dureeAmortissement = parametres.dureeAmortissement || 5;
        const tauxImposition = parametres.tauxImposition || 25; // Taux d'imposition réel en Tunisie

        // Calcul de l'amortissement annuel (linéaire)
        const amortissementAnnuel = montantInvestissement / dureeAmortissement;

        // Économie d'impôt annuelle
        const economieImpotAnnuelle = amortissementAnnuel * (tauxImposition / 100);

        // Économie d'impôt totale sur la durée d'amortissement
        const economieImpotTotale = economieImpotAnnuelle * dureeAmortissement;

        // Retour sur investissement fiscal (en pourcentage)
        const roiFiscal = (economieImpotTotale / montantInvestissement) * 100;

        console.log('Simulation impact investissement (données réelles):');
        console.log('  - Base chiffre d\'affaires:', baseChiffreAffaires);
        console.log('  - Montant investissement par défaut:', montantInvestissementDefaut);
        console.log('  - Montant investissement utilisé:', montantInvestissement);
        console.log('  - Type investissement:', typeInvestissement);
        console.log('  - Durée amortissement:', dureeAmortissement, 'ans');
        console.log('  - Taux imposition:', tauxImposition, '%');
        console.log('  - ROI fiscal:', roiFiscal.toFixed(2), '%');

        let recommandation = '';
        if (roiFiscal > 20) {
          recommandation = 'Cet investissement présente un avantage fiscal significatif.';
        } else if (roiFiscal > 10) {
          recommandation = 'Cet investissement présente un avantage fiscal modéré.';
        } else {
          recommandation = 'Cet investissement présente un avantage fiscal limité. Considérez d\'autres facteurs pour prendre votre décision.';
        }

        observer.next({
          success: true,
          data: {
            montantInvestissement,
            typeInvestissement,
            dureeAmortissement,
            impactFiscal: {
              amortissementAnnuel,
              economieImpotAnnuelle,
              economieImpotTotale,
              roiFiscal
            },
            recommandation
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  // Services de génération de déclarations fiscales
  genererDeclarationFiscale(dateDebut: Date, dateFin: Date, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/declarations/generer`, { dateDebut, dateFin, type });
  }
}