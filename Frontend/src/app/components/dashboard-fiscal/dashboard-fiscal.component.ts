import { Component, OnInit } from '@angular/core';
import { FiscalService } from '../../services/fiscal.service.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { trigger, transition, style, animate } from '@angular/animations';

// Interface pour les données du tableau de bord
interface DashboardData {
  soldeTVA: number;
  montantTCL: number;
  droitTimbre: number;
  nombreDeclarations: number;
  indicateursMensuels: {
    nomMois: string;
    tvaCollectee: number;
    tvaDeductible: number;
    soldeTVA: number;
  }[];
  declarations: any[];
}

@Component({
  selector: 'app-dashboard-fiscal',
  templateUrl: './dashboard-fiscal.component.html',
  styleUrls: ['./dashboard-fiscal.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardFiscalComponent implements OnInit {
  dashboard: DashboardData | null = null;
  anneeSelectionnee: number = new Date().getFullYear();
  anneesDisponibles: number[] = [];
  isLoading: boolean = false;
  errors: string[] = [];
  displayedColumns: string[] = ['periode', 'montantTotal', 'statut', 'actions'];

  // Configuration des graphiques
  chartTVA: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'TVA Collectée',
        data: [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'TVA Déductible',
        data: [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Solde TVA',
        data: [],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      }
    ]
  };

  chartRepartition: ChartConfiguration['data'] = {
    labels: ['TVA', 'TCL', 'Droit de timbre'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        hoverOffset: 4
      }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  chartOptionsDonut: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  constructor(private fiscalService: FiscalService) {}

  ngOnInit(): void {
    this.initialiserAnneesDisponibles();
    this.chargerDashboard();
  }

  initialiserAnneesDisponibles(): void {
    const anneeActuelle = new Date().getFullYear();
    for (let i = anneeActuelle - 5; i <= anneeActuelle; i++) {
      this.anneesDisponibles.push(i);
    }
  }

  chargerDashboard(): void {
    this.isLoading = true;
    this.errors = [];

    this.fiscalService.getDashboardFiscal(this.anneeSelectionnee).subscribe({
      next: (response) => {
        this.dashboard = response.data;
        this.mettreAJourGraphiques();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du tableau de bord:', error);
        if (error.error && error.error.message) {
          this.errors.push(error.error.message);
        } else {
          this.errors.push('Erreur lors du chargement des données');
        }
        this.isLoading = false;
      }
    });
  }

  mettreAJourGraphiques(): void {
    if (!this.dashboard) return;

    // Mise à jour du graphique TVA
    const labels = this.dashboard.indicateursMensuels.map(item => item.nomMois);
    const tvaCollectee = this.dashboard.indicateursMensuels.map(item => item.tvaCollectee);
    const tvaDeductible = this.dashboard.indicateursMensuels.map(item => item.tvaDeductible);
    const soldeTVA = this.dashboard.indicateursMensuels.map(item => item.soldeTVA);

    this.chartTVA.labels = labels;
    this.chartTVA.datasets[0].data = tvaCollectee;
    this.chartTVA.datasets[1].data = tvaDeductible;
    this.chartTVA.datasets[2].data = soldeTVA;

    // Mise à jour du graphique de répartition
    this.chartRepartition.datasets[0].data = [
      Math.abs(this.dashboard.soldeTVA),
      this.dashboard.montantTCL,
      this.dashboard.droitTimbre
    ];
  }
}