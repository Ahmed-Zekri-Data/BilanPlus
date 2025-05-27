import { Component, OnInit } from '@angular/core';
import { TestDataService } from '../../test-data.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { EcritureComptableService } from '../../ecriture-comptable.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-debug',
  template: `
    <div class="debug-container">
      <h2>Debug des Données</h2>

      <div class="debug-section">
        <h3>1. Test de Connexion Backend</h3>
        <button (click)="testConnection()">Tester Connexion</button>
        <div *ngIf="connectionResult">{{ connectionResult | json }}</div>
      </div>

      <div class="debug-section">
        <h3>2. Comptes Comptables</h3>
        <button (click)="loadComptes()">Charger Comptes</button>
        <div *ngIf="comptes.length > 0">
          <p>Nombre de comptes: {{ comptes.length }}</p>
          <ul>
            <li *ngFor="let compte of comptes">
              {{ compte.numeroCompte }} - {{ compte.nom }} ({{ compte.type }})
            </li>
          </ul>
        </div>
      </div>

      <div class="debug-section">
        <h3>3. Écritures Comptables</h3>
        <button (click)="loadEcritures()">Charger Écritures</button>
        <div *ngIf="ecritures.length > 0">
          <p>Nombre d'écritures: {{ ecritures.length }}</p>
          <ul>
            <li *ngFor="let ecriture of ecritures">
              {{ ecriture.libelle }} - {{ ecriture.date | date }}
              ({{ ecriture.lignes?.length }} lignes)
            </li>
          </ul>
        </div>
      </div>

      <div class="debug-section">
        <h3>4. Test Cash Flow</h3>
        <button (click)="testCashFlow()">Tester Cash Flow</button>
        <div *ngIf="cashFlowResult">
          <pre>{{ cashFlowResult | json }}</pre>
        </div>
      </div>

      <div class="debug-section">
        <h3>5. Test Ratios Financiers</h3>
        <button (click)="testRatios()">Tester Ratios</button>
        <div *ngIf="ratiosResult">
          <pre>{{ ratiosResult | json }}</pre>
        </div>
      </div>

      <div class="debug-section" *ngIf="error">
        <h3>Erreurs</h3>
        <div class="error">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .debug-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .debug-section {
      margin-bottom: 30px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 3px;
      cursor: pointer;
      margin-bottom: 10px;
    }

    button:hover {
      background: #0056b3;
    }

    pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
      font-size: 12px;
    }

    .error {
      color: red;
      background: #ffe6e6;
      padding: 10px;
      border-radius: 3px;
    }

    ul {
      max-height: 200px;
      overflow-y: auto;
    }
  `]
})
export class TestDebugComponent implements OnInit {
  connectionResult: any = null;
  comptes: any[] = [];
  ecritures: any[] = [];
  cashFlowResult: any = null;
  ratiosResult: any = null;
  error: string = '';

  constructor(
    private testDataService: TestDataService,
    private compteService: CompteComptableService,
    private ecritureService: EcritureComptableService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Auto-load data on init
    this.loadComptes();
    this.loadEcritures();
  }

  testConnection() {
    this.http.get('http://localhost:4000/comptes').subscribe({
      next: (result: any) => {
        this.connectionResult = { message: 'Backend connecté!', data: result };
        this.error = '';
      },
      error: (err: any) => {
        this.error = `Erreur de connexion: ${err.message}`;
        this.connectionResult = null;
      }
    });
  }

  loadComptes() {
    this.compteService.getComptes().subscribe({
      next: (comptes: any) => {
        this.comptes = comptes;
        this.error = '';
      },
      error: (err: any) => {
        this.error = `Erreur lors du chargement des comptes: ${err.message}`;
      }
    });
  }

  loadEcritures() {
    this.ecritureService.getEcritures().subscribe({
      next: (ecritures: any) => {
        this.ecritures = ecritures;
        this.error = '';
      },
      error: (err: any) => {
        this.error = `Erreur lors du chargement des écritures: ${err.message}`;
      }
    });
  }

  testCashFlow() {
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';

    this.http.get(`http://localhost:4000/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`).subscribe({
      next: (result: any) => {
        this.cashFlowResult = result;
        this.error = '';
      },
      error: (err: any) => {
        this.error = `Erreur Cash Flow: ${err.message}`;
        this.cashFlowResult = null;
      }
    });
  }

  testRatios() {
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';

    this.http.get(`http://localhost:4000/reports/financial-ratios?startDate=${startDate}&endDate=${endDate}`).subscribe({
      next: (result: any) => {
        this.ratiosResult = result;
        this.error = '';
      },
      error: (err: any) => {
        this.error = `Erreur Ratios: ${err.message}`;
        this.ratiosResult = null;
      }
    });
  }
}
