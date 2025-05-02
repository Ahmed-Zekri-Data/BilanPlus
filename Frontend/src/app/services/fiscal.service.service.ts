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
    return this.http.get(`${this.apiUrl}/tva/facture/${factureId}`);
  }

  calculerTVADeductible(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/tva/deductible`, { dateDebut, dateFin });
  }

  reconciliationTVA(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/tva/reconciliation`, { dateDebut, dateFin });
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

  calculerDroitTimbrePeriode(dateDebut: Date, dateFin: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/droit-timbre/periode`, { dateDebut, dateFin });
  }

  // Services Dashboard Fiscal
  getDashboardFiscal(annee: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${annee}`);
  }

  // Services Simulation Fiscale
  simulerChangementVolumeActivite(parametres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulation/volume-activite`, parametres);
  }

  simulerChangementRegimeImposition(parametres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulation/regime-imposition`, parametres);
  }

  simulerImpactInvestissement(parametres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulation/investissement`, parametres);
  }

  // Services de génération de déclarations fiscales
  genererDeclarationFiscale(dateDebut: Date, dateFin: Date, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/declarations/generer`, { dateDebut, dateFin, type });
  }
}