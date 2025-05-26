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
}
