import { Component, OnInit } from '@angular/core';
import { FiscalService } from '../../services/fiscal.service.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

// Interface for dashboard data
interface DashboardData {
  indicateursMensuels: {
    nomMois: string;
    tvaCollectee: number;
    tvaDeductible: number;
    soldeTVA: number;
  }[];
}

@Component({
  selector: 'app-dashboard-fiscal',
  templateUrl: './dashboard-fiscal.component.html',
  styleUrls: ['./dashboard-fiscal.component.css']
})
export class DashboardFiscalComponent implements OnInit {
  dashboard: DashboardData | null = null; // Use interface instead of any
  anneeSelectionnee: number = new Date().getFullYear();
  isLoading: boolean = false;
  errors: string[] = []; // Added for error handling
  
  // Configuration des graphiques
  chartTVA: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'TVA Collectée',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'TVA Déductible',
        data: [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'Solde TVA',
        data: [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }
    ]
  };
  
  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Montant (TND)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  constructor(private fiscalService: FiscalService) { }

  ngOnInit(): void {
    this.chargerDashboard();
  }

  chargerDashboard(): void {
    this.isLoading = true;
    this.errors = [];
    
    this.fiscalService.getDashboardFiscal(this.anneeSelectionnee)
      .subscribe({
        next: (response) => {
          this.dashboard = response.data;
          this.configurerGraphiques();
          this.isLoading = false;
        },
        error: (error) => {
          this.errors = [error.message || 'Erreur lors du chargement du tableau de bord'];
          console.error('Erreur:', error);
          this.isLoading = false;
        }
      });
  }

  configurerGraphiques(): void {
    if (!this.dashboard || !this.dashboard.indicateursMensuels) return;
    
    // Configurer les labels (mois)
    this.chartTVA.labels = this.dashboard.indicateursMensuels.map((indic: { nomMois: string }) => indic.nomMois);
    
    // Configurer les données TVA
    this.chartTVA.datasets[0].data = this.dashboard.indicateursMensuels.map((indic: { tvaCollectee: number }) => indic.tvaCollectee);
    this.chartTVA.datasets[1].data = this.dashboard.indicateursMensuels.map((indic: { tvaDeductible: number }) => indic.tvaDeductible);
    this.chartTVA.datasets[2].data = this.dashboard.indicateursMensuels.map((indic: { soldeTVA: number }) => indic.soldeTVA);
  }

  changerAnnee(event: any): void {
    this.anneeSelectionnee = event.target.value;
    this.chargerDashboard();
  }
}