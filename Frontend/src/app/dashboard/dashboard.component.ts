import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { StockManagementService } from '../services/gestion-de-stock.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('200ms ease-in')),
      transition('clicked => normal', animate('200ms ease-out'))
    ])
  ]
})
export class DashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  statistics: { totalStock: number, totalStockValue: number, outOfStock: number } | null = null;
  buttonState = 'normal';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Statistiques des Stocks', color: '#1E3A8A' }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Stock Total', 'Valeur Totale (€)', 'Ruptures de Stock'],
    datasets: [{
      data: [0, 0, 0],
      label: 'Statistiques',
      backgroundColor: ['#36A2EB', '#D4AF37', '#FF6384'],
      borderColor: ['#1E3A8A', '#1E3A8A', '#1E3A8A'],
      borderWidth: 1
    }]
  };

  constructor(
    private stockService: StockManagementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.stockService.getStatistics().subscribe({
      next: (stats) => {
        console.log('Statistics received:', stats);
        this.statistics = stats;
        this.barChartData.datasets[0].data = [
          stats.totalStock,
          stats.totalStockValue,
          stats.outOfStock
        ];
        console.log('Updated barChartData:', this.barChartData);
        this.cdr.detectChanges();
        if (this.chart) {
          this.chart.update();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    });
  }

  onButtonClick() {
    this.buttonState = this.buttonState === 'normal' ? 'clicked' : 'normal';
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }
}