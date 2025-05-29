import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompteComptableService } from '../../compte-comptable.service';
import { EcritureComptableService } from '../../ecriture-comptable.service';
import { AdvancedReportsService } from '../../services/advanced-reports.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-validation-test',
  templateUrl: './validation-test.component.html',
  styleUrls: ['./validation-test.component.css']
})
export class ValidationTestComponent implements OnInit {
  testResults: any = {
    connectivity: { status: 'pending', message: '', details: null },
    comptes: { status: 'pending', message: '', details: null },
    ecritures: { status: 'pending', message: '', details: null },
    reports: { status: 'pending', message: '', details: null },
    advanced: { status: 'pending', message: '', details: null }
  };

  isRunning = false;
  currentTest = '';

  constructor(
    private http: HttpClient,
    private compteService: CompteComptableService,
    private ecritureService: EcritureComptableService,
    private advancedReportsService: AdvancedReportsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  async runAllTests() {
    this.isRunning = true;
    this.resetResults();

    try {
      await this.testConnectivity();
      await this.testComptes();
      await this.testEcritures();
      await this.testReports();
      await this.testAdvancedReports();
      
      this.showSummary();
    } catch (error) {
      console.error('Erreur lors des tests:', error);
    } finally {
      this.isRunning = false;
      this.currentTest = '';
    }
  }

  resetResults() {
    Object.keys(this.testResults).forEach(key => {
      this.testResults[key] = { status: 'pending', message: '', details: null };
    });
  }

  async testConnectivity() {
    this.currentTest = 'Test de connectivité...';
    
    try {
      const response = await this.http.get('http://localhost:4000/comptes').toPromise();
      this.testResults.connectivity = {
        status: 'success',
        message: 'Backend connecté avec succès',
        details: `${Array.isArray(response) ? response.length : 0} comptes trouvés`
      };
    } catch (error: any) {
      this.testResults.connectivity = {
        status: 'error',
        message: 'Erreur de connexion backend',
        details: error.message
      };
    }
  }

  async testComptes() {
    this.currentTest = 'Test du module Comptes...';
    
    try {
      // Test lecture
      const comptes = await this.compteService.getComptes().toPromise();
      
      // Test création si pas de comptes
      if (!comptes || comptes.length === 0) {
        const testCompte = {
          numeroCompte: 'TEST001',
          nom: 'Compte de test',
          type: 'actif' as const,
          solde: 1000
        };
        
        await this.compteService.createCompte(testCompte).toPromise();
        
        this.testResults.comptes = {
          status: 'success',
          message: 'Module Comptes fonctionnel',
          details: 'Compte de test créé avec succès'
        };
      } else {
        this.testResults.comptes = {
          status: 'success',
          message: 'Module Comptes fonctionnel',
          details: `${comptes.length} comptes existants`
        };
      }
    } catch (error: any) {
      this.testResults.comptes = {
        status: 'error',
        message: 'Erreur module Comptes',
        details: error.message
      };
    }
  }

  async testEcritures() {
    this.currentTest = 'Test du module Écritures...';
    
    try {
      const ecritures = await this.ecritureService.getEcritures().toPromise();
      
      this.testResults.ecritures = {
        status: 'success',
        message: 'Module Écritures fonctionnel',
        details: `${ecritures ? ecritures.length : 0} écritures trouvées`
      };
    } catch (error: any) {
      this.testResults.ecritures = {
        status: 'error',
        message: 'Erreur module Écritures',
        details: error.message
      };
    }
  }

  async testReports() {
    this.currentTest = 'Test des rapports standards...';
    
    try {
      // Test des endpoints de rapports
      const endpoints = [
        'http://localhost:4000/journal',
        'http://localhost:4000/grand-livre',
        'http://localhost:4000/balance',
        'http://localhost:4000/bilan',
        'http://localhost:4000/resultat'
      ];

      let successCount = 0;
      const results = [];

      for (const endpoint of endpoints) {
        try {
          await this.http.get(endpoint).toPromise();
          successCount++;
          results.push(`✅ ${endpoint.split('/').pop()}`);
        } catch (error) {
          results.push(`❌ ${endpoint.split('/').pop()}`);
        }
      }

      this.testResults.reports = {
        status: successCount === endpoints.length ? 'success' : 'warning',
        message: `${successCount}/${endpoints.length} rapports fonctionnels`,
        details: results.join(', ')
      };
    } catch (error: any) {
      this.testResults.reports = {
        status: 'error',
        message: 'Erreur rapports standards',
        details: error.message
      };
    }
  }

  async testAdvancedReports() {
    this.currentTest = 'Test des rapports avancés...';
    
    try {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      
      const tests = [];
      
      // Test Cash Flow
      try {
        await this.advancedReportsService.getCashFlowStatement(startDate, endDate).toPromise();
        tests.push('✅ Cash Flow');
      } catch {
        tests.push('❌ Cash Flow');
      }
      
      // Test Ratios
      try {
        await this.advancedReportsService.getFinancialRatios(startDate, endDate).toPromise();
        tests.push('✅ Ratios');
      } catch {
        tests.push('❌ Ratios');
      }
      
      // Test Comparatifs
      try {
        await this.advancedReportsService.getComparativeReport('year-over-year', startDate, endDate).toPromise();
        tests.push('✅ Comparatifs');
      } catch {
        tests.push('❌ Comparatifs');
      }

      const successCount = tests.filter(t => t.includes('✅')).length;
      
      this.testResults.advanced = {
        status: successCount === 3 ? 'success' : 'warning',
        message: `${successCount}/3 rapports avancés fonctionnels`,
        details: tests.join(', ')
      };
    } catch (error: any) {
      this.testResults.advanced = {
        status: 'error',
        message: 'Erreur rapports avancés',
        details: error.message
      };
    }
  }

  showSummary() {
    const results = Object.values(this.testResults);
    const successCount = results.filter((r: any) => r.status === 'success').length;
    const totalTests = results.length;
    
    if (successCount === totalTests) {
      this.snackBar.open(
        `🎉 Tous les tests réussis ! (${successCount}/${totalTests})`,
        'Fermer',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
    } else {
      this.snackBar.open(
        `⚠️ ${successCount}/${totalTests} tests réussis`,
        'Fermer',
        { duration: 5000, panelClass: ['warning-snackbar'] }
      );
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'status-success';
      case 'error': return 'status-error';
      case 'warning': return 'status-warning';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  async createTestData() {
    this.currentTest = 'Création des données de test...';
    
    try {
      // Créer des comptes de test
      const testComptes = [
        { numeroCompte: '411000', nom: 'Clients', type: 'actif', solde: 15000 },
        { numeroCompte: '701000', nom: 'Ventes', type: 'produit', solde: 0 },
        { numeroCompte: '601000', nom: 'Achats', type: 'charge', solde: 0 },
        { numeroCompte: '401000', nom: 'Fournisseurs', type: 'passif', solde: 12000 },
        { numeroCompte: '512000', nom: 'Banque', type: 'actif', solde: 25000 }
      ];

      for (const compte of testComptes) {
        try {
          await this.compteService.createCompte(compte).toPromise();
        } catch (error) {
          // Ignorer si le compte existe déjà
        }
      }

      this.snackBar.open('Données de test créées avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      
      // Relancer les tests
      this.runAllTests();
    } catch (error: any) {
      this.snackBar.open(`Erreur création données: ${error.message}`, 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
