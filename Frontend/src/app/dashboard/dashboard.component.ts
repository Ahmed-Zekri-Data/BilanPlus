import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  facturesCount = 10;
  overdueCount = 3;
  totalAmount = 24500;
  totalPaid = 19500;

  factureStatusData = [
    { label: 'Payées', count: 6, color: '#2ecc71' },
    { label: 'En attente', count: 3, color: '#f1c40f' },
    { label: 'En retard', count: 1, color: '#e74c3c' }
  ];

  monthlyData = [
    { month: 'Février', amount: 7200 },
    { month: 'Mars', amount: 8300 },
    { month: 'Avril', amount: 9000 }
  ];

  alerts = [
    {
      title: 'Facture en retard',
      description: 'Facture #2024-008 est en retard de paiement',
      priority: 'high',
      icon: '⚠️'
    },
    {
      title: 'Nouveau client ajouté',
      description: 'Client "Entreprise X" a été ajouté récemment',
      priority: 'low',
      icon: '🆕'
    }
  ];

  maxMonthlyAmount = Math.max(...this.monthlyData.map(d => d.amount));

  constructor(private router: Router) {}

  ngOnInit(): void {}

  getPercentage(value: number, max: number): number {
    return (value / max) * 100;
  }

  navigateToClients(): void {
    this.router.navigate(['/clients']);
  }

  navigateToDevis(): void {
    this.router.navigate(['/devis']);
  }

  navigateToFactures(): void {
    this.router.navigate(['/factures']);
  }

  navigateToRelances(): void {
    this.router.navigate(['/relances']);
  }

  viewAlertDetails(alert: any): void {
    alert('Détail alerte : ' + alert.title);
  }
}
