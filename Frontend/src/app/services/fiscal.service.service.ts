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
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        // Années pour lesquelles nous avons des données simulées
        const anneesDisponibles = [2023, 2024, 2025];

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

        // Générer des données simulées pour l'année demandée
        const totalTVACollectee = Math.random() * 50000 + 10000;
        const totalTVADeductible = Math.random() * 30000 + 5000;
        const soldeTVA = totalTVACollectee - totalTVADeductible;
        const totalTCL = Math.random() * 5000 + 1000;
        const totalDroitTimbre = Math.random() * 2000 + 500;
        const totalChargesFiscales = (soldeTVA > 0 ? soldeTVA : 0) + totalTCL + totalDroitTimbre;

        // Générer des indicateurs mensuels
        const indicateursMensuels = [];
        for (let mois = 1; mois <= 12; mois++) {
          const nomMois = new Date(annee, mois - 1, 1).toLocaleString('fr-FR', { month: 'long' });
          const tvaCollectee = Math.random() * 5000 + 500;
          const tvaDeductible = Math.random() * 3000 + 300;
          const soldeTVA = tvaCollectee - tvaDeductible;
          const tcl = Math.random() * 500 + 50;
          const droitTimbre = Math.random() * 200 + 20;

          indicateursMensuels.push({
            mois,
            nomMois,
            tvaCollectee,
            tvaDeductible,
            soldeTVA,
            tcl,
            droitTimbre,
            totalChargesFiscales: (soldeTVA > 0 ? soldeTVA : 0) + tcl + droitTimbre
          });
        }

        // Générer des déclarations fiscales
        const declarations = [];
        for (let mois = 1; mois <= 12; mois++) {
          const debut = new Date(annee, mois - 1, 1);
          const fin = new Date(annee, mois, 0);

          declarations.push({
            id: 'DF-' + annee + '-' + mois,
            periode: `${debut.toISOString().split('T')[0]} - ${fin.toISOString().split('T')[0]}`,
            periodeDebut: debut.toISOString().split('T')[0],
            periodeFin: fin.toISOString().split('T')[0],
            type: Math.random() > 0.7 ? 'trimestrielle' : 'mensuelle',
            statut: ['brouillon', 'soumise', 'validée', 'payé'][Math.floor(Math.random() * 4)],
            tvaDue: Math.random() * 5000,
            tcl: Math.random() * 500,
            droitTimbre: Math.random() * 200,
            totalAPayer: Math.random() * 6000,
            dateCreation: new Date(annee, mois - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
            dateSoumission: Math.random() > 0.5 ? new Date(annee, mois - 1, Math.floor(Math.random() * 28) + 1).toISOString() : null
          });
        }

        observer.next({
          success: true,
          data: {
            annee,
            dataAvailable: true,
            resume: {
              totalTVACollectee,
              totalTVADeductible,
              soldeTVA,
              totalTCL,
              totalDroitTimbre,
              totalChargesFiscales
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
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          data: [2023, 2024, 2025]
        });
        observer.complete();
      }, 500);
    });
  }



  // Services Simulation Fiscale
  simulerChangementVolumeActivite(parametres: any): Observable<any> {
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        const chiffreAffairesActuel = parametres.chiffreAffairesActuel || 100000;
        const pourcentageVariation = parametres.pourcentageVariation || 10;
        const chiffreAffairesProjecte = chiffreAffairesActuel * (1 + pourcentageVariation / 100);

        const tvaActuelle = chiffreAffairesActuel * 0.19;
        const tvaProjetee = chiffreAffairesProjecte * 0.19;

        const tclActuelle = chiffreAffairesActuel * 0.002;
        const tclProjetee = chiffreAffairesProjecte * 0.002;

        const variationTotale = (tvaProjetee - tvaActuelle) + (tclProjetee - tclActuelle);

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
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        const chiffreAffaires = parametres.chiffreAffairesActuel || 100000;
        const regimeActuel = parametres.regimeActuel || 'reel';
        const regimeCible = parametres.regimeCible || 'forfaitaire';

        // Calcul simplifié des charges fiscales selon le régime
        const chargesFiscalesActuel = regimeActuel === 'reel' ? chiffreAffaires * 0.25 : chiffreAffaires * 0.15;
        const chargesFiscalesCible = regimeCible === 'reel' ? chiffreAffaires * 0.25 : chiffreAffaires * 0.15;

        const difference = chargesFiscalesCible - chargesFiscalesActuel;
        const pourcentageEconomie = (difference / chargesFiscalesActuel) * -100;

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
    // Simulation côté client pour le moment (à remplacer par un appel API réel plus tard)
    return new Observable(observer => {
      setTimeout(() => {
        const montantInvestissement = parametres.montantInvestissement || 50000;
        const typeInvestissement = parametres.typeInvestissement || 'materiel';
        const dureeAmortissement = parametres.dureeAmortissement || 5;
        const tauxImposition = parametres.tauxImposition || 25;

        // Calcul de l'amortissement annuel (linéaire)
        const amortissementAnnuel = montantInvestissement / dureeAmortissement;

        // Économie d'impôt annuelle
        const economieImpotAnnuelle = amortissementAnnuel * (tauxImposition / 100);

        // Économie d'impôt totale sur la durée d'amortissement
        const economieImpotTotale = economieImpotAnnuelle * dureeAmortissement;

        // Retour sur investissement fiscal (en pourcentage)
        const roiFiscal = (economieImpotTotale / montantInvestissement) * 100;

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