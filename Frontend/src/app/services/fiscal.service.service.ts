// Frontend/src/app/services/fiscal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiscalService {
  private apiUrl =  'http://localhost:3000/fiscalité';

  constructor(private http: HttpClient) { }

  // Services TVA
  calculerTVAFacture(factureId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tva/facture/${factureId}`);
  }

  calculerTVADeductible(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/tva/deductible`, { dateDebut, dateFin });
  }

  reconciliationTVA(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/tva/reconciliation`, { dateDebut, dateFin });
  }

  verifierRegimeForfaitaire(entreprise: any, chiffreAffairesAnnuel: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tva/regime-forfaitaire`, { entreprise, chiffreAffairesAnnuel });
  }

  // Services TCL
  calculerTCL(dateDebut: Date, dateFin: Date, tauxTCL?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tcl/calculer`, { dateDebut, dateFin, tauxTCL });
  }

  calculerTCLParCommune(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/tcl/par-commune`, { dateDebut, dateFin });
  }

  verifierExonerationTCL(secteurActivite: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tcl/exoneration`, { secteurActivite });
  }

  // Services Droit de Timbre
  calculerDroitTimbreFacture(factureId: string, valeurTimbre?: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/droit-timbre/facture/${factureId}`, {
      params: valeurTimbre ? { valeurTimbre: valeurTimbre.toString() } : {}
    });
  }

  calculerDroitTimbrePeriode(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/droit-timbre/periode`, { dateDebut, dateFin });
  }

  genererRapportDroitTimbre(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/droit-timbre/rapport`, { dateDebut, dateFin });
  }

  // Services Déclaration Fiscale
  genererDeclarationFiscale(dateDebut: Date, dateFin: Date, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/declaration/generer`, { dateDebut, dateFin, type });
  }

  genererFormulaireOfficiel(declarationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/declaration/formulaire/${declarationId}`);
  }

  verifierDelaisDeclaration(type: string, finPeriode: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/declaration/verification-delais`, { type, finPeriode });
  }

  soumettreDeclaration(declarationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/declaration/soumettre/${declarationId}`, {});
  }

  // Services Dashboard et Simulation
  getDashboardFiscal(annee: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${annee}`);
  }

  simulerChangementVolumeActivite(parametres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulation/volume-activite`, parametres);
  }

  simulerChangementRegimeImposition(parametres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulation/regime-imposition`, parametres);
  }

  simulerImpactInvestissement(parametres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulation/investissement`, parametres);
  }
}
