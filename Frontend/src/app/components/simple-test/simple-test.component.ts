import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-simple-test',
  template: `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2>Test Simple des Données</h2>
      
      <div style="margin-bottom: 20px;">
        <button (click)="testBackend()" style="background: #007bff; color: white; border: none; padding: 10px 15px; border-radius: 3px; cursor: pointer;">
          Tester Backend
        </button>
        <div *ngIf="backendResult" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 3px;">
          <strong>Résultat:</strong> {{ backendResult }}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <button (click)="loadData()" style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 3px; cursor: pointer;">
          Charger Données
        </button>
        <div *ngIf="dataLoaded" style="margin-top: 10px;">
          <p><strong>Comptes:</strong> {{ comptes.length }}</p>
          <p><strong>Écritures:</strong> {{ ecritures.length }}</p>
          <div *ngIf="comptes.length > 0" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;">
            <div *ngFor="let compte of comptes" style="margin-bottom: 5px;">
              {{ compte.numeroCompte }} - {{ compte.nom }} ({{ compte.type }})
            </div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <button (click)="testReports()" style="background: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 3px; cursor: pointer;">
          Tester Rapports
        </button>
        <div *ngIf="reportsResult" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 3px;">
          <pre style="white-space: pre-wrap; font-size: 12px;">{{ reportsResult }}</pre>
        </div>
      </div>

      <div *ngIf="error" style="color: red; background: #ffe6e6; padding: 10px; border-radius: 3px; margin-top: 10px;">
        <strong>Erreur:</strong> {{ error }}
      </div>
    </div>
  `
})
export class SimpleTestComponent implements OnInit {
  backendResult: string = '';
  comptes: any[] = [];
  ecritures: any[] = [];
  dataLoaded: boolean = false;
  reportsResult: string = '';
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  testBackend() {
    this.error = '';
    this.http.get('http://localhost:4000/comptes').subscribe({
      next: (result: any) => {
        this.backendResult = `Backend OK - ${result.length} comptes trouvés`;
      },
      error: (err: any) => {
        this.error = `Backend Error: ${err.message || err.status || 'Connexion impossible'}`;
        this.backendResult = '';
      }
    });
  }

  loadData() {
    this.error = '';
    
    // Charger les comptes
    this.http.get('http://localhost:4000/comptes').subscribe({
      next: (comptes: any) => {
        this.comptes = comptes;
        
        // Charger les écritures
        this.http.get('http://localhost:4000/ecritures').subscribe({
          next: (ecritures: any) => {
            this.ecritures = ecritures;
            this.dataLoaded = true;
          },
          error: (err: any) => {
            this.error = `Erreur écritures: ${err.message}`;
          }
        });
      },
      error: (err: any) => {
        this.error = `Erreur comptes: ${err.message}`;
      }
    });
  }

  testReports() {
    this.error = '';
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    
    // Test Cash Flow
    this.http.get(`http://localhost:4000/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`).subscribe({
      next: (cashFlow: any) => {
        // Test Ratios
        this.http.get(`http://localhost:4000/reports/financial-ratios?startDate=${startDate}&endDate=${endDate}`).subscribe({
          next: (ratios: any) => {
            this.reportsResult = `CASH FLOW:\n${JSON.stringify(cashFlow, null, 2)}\n\nRATIOS:\n${JSON.stringify(ratios, null, 2)}`;
          },
          error: (err: any) => {
            this.error = `Erreur Ratios: ${err.message}`;
          }
        });
      },
      error: (err: any) => {
        this.error = `Erreur Cash Flow: ${err.message}`;
      }
    });
  }
}
