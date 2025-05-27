import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {
    statistiques: {
      totalComptes: 0,
      totalEcritures: 0,
      totalActif: 0,
      totalPassif: 0,
      totalCharges: 0,
      totalProduits: 0,
      resultatPeriode: 0
    },
    derniereEcriture: null,
    dernieresEcritures: [],
    sixMoisDerniers: []
  };
  isLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.isLoading = true;

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(
          'Erreur lors du chargement des données du tableau de bord',
          'Fermer',
          { duration: 3000 }
        );
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Méthode pour calculer la hauteur des barres du graphique
  getBarHeight(count: number): number {
    if (!this.dashboardData.sixMoisDerniers || !this.dashboardData.sixMoisDerniers.length) {
      return 0;
    }
    const maxCount = Math.max(...this.dashboardData.sixMoisDerniers.map((m: any) => m.count || 0));
    return maxCount ? (count / maxCount) * 100 : 0;
  }

  // Méthode pour formater la nature de l'écriture (débit ou crédit)
  formatNature(nature: string): string {
    return nature === 'débit' ? 'Débit' : 'Crédit';
  }

  // Financial Health Indicators Methods
  getBalanceHealthClass(): string {
    const actif = this.dashboardData.statistiques.totalActif || 0;
    const passif = this.dashboardData.statistiques.totalPassif || 0;
    const difference = Math.abs(actif - passif);
    const tolerance = Math.max(actif, passif) * 0.01; // 1% tolerance

    if (difference <= tolerance) {
      return 'health-excellent';
    } else if (difference <= tolerance * 5) {
      return 'health-good';
    } else {
      return 'health-warning';
    }
  }

  getBalanceHealthIcon(): string {
    const healthClass = this.getBalanceHealthClass();
    switch (healthClass) {
      case 'health-excellent': return 'check_circle';
      case 'health-good': return 'info';
      default: return 'warning';
    }
  }

  getBalanceStatus(): string {
    const actif = this.dashboardData.statistiques.totalActif || 0;
    const passif = this.dashboardData.statistiques.totalPassif || 0;
    const difference = Math.abs(actif - passif);
    const tolerance = Math.max(actif, passif) * 0.01;

    if (difference <= tolerance) {
      return 'Équilibré';
    } else if (actif > passif) {
      return 'Actif supérieur';
    } else {
      return 'Passif supérieur';
    }
  }

  getAssetLiabilityRatio(): number {
    const actif = this.dashboardData.statistiques.totalActif || 0;
    const passif = this.dashboardData.statistiques.totalPassif || 1; // Avoid division by zero
    return Math.round((actif / passif) * 100);
  }

  getResultHealthClass(): string {
    const resultat = this.dashboardData.statistiques.resultatPeriode || 0;
    if (resultat > 0) {
      return 'health-excellent';
    } else if (resultat === 0) {
      return 'health-neutral';
    } else {
      return 'health-warning';
    }
  }

  getResultHealthIcon(): string {
    const resultat = this.dashboardData.statistiques.resultatPeriode || 0;
    if (resultat > 0) {
      return 'trending_up';
    } else if (resultat === 0) {
      return 'trending_flat';
    } else {
      return 'trending_down';
    }
  }

  // Enhanced Chart Methods
  getMonthlyAverage(): number {
    if (!this.dashboardData.sixMoisDerniers || this.dashboardData.sixMoisDerniers.length === 0) {
      return 0;
    }
    const total = this.dashboardData.sixMoisDerniers.reduce((sum: number, month: any) => sum + (month.count || 0), 0);
    return Math.round(total / this.dashboardData.sixMoisDerniers.length);
  }

  getMostActiveMonth(): string {
    if (!this.dashboardData.sixMoisDerniers || this.dashboardData.sixMoisDerniers.length === 0) {
      return 'Aucun';
    }
    const mostActive = this.dashboardData.sixMoisDerniers.reduce((max: any, month: any) =>
      (month.count || 0) > (max.count || 0) ? month : max
    );
    return mostActive.mois || 'Aucun';
  }

  getBarColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #D4AF37 0%, #f4d03f 100%)',
      'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
      'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
      'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
      'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
    ];
    return colors[index % colors.length];
  }
}
