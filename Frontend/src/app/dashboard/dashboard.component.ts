import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  facturesCount: number = 0;
  overdueCount: number = 0;
  totalAmount: number = 0;
  totalPaid: number = 0;
  factureStatusData: { label: string, count: number, color: string }[] = [];
  monthlyData: { month: string, amount: number }[] = [];
  alerts: { title: string, description: string, priority: string, icon: string, factureId?: string }[] = [];
  maxMonthlyAmount: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const paiements = JSON.parse(localStorage.getItem('paiements') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const devis = JSON.parse(localStorage.getItem('devis') || '[]');

    this.facturesCount = factures.filter((f: any) => f.statut !== 'Payée').length;
    this.overdueCount = factures.filter((f: any) => f.statut === 'En retard').length;
    
    // Calculer le montant total impayé
    this.totalAmount = factures.reduce((sum: number, f: any) => {
      if (f.statut === 'Payée') return sum; // Ignorer les factures payées
      const facturePayments = paiements.filter((p: any) => p.factureId === f._id);
      const totalPaidForFacture = facturePayments.reduce((paymentSum: number, p: any) => paymentSum + Number(p.montant || 0), 0);
      const remaining = Number(f.montantTTC || 0) - totalPaidForFacture;
      return sum + Math.max(0, remaining);
    }, 0);

    this.totalPaid = paiements.reduce((sum: number, p: any) => sum + Number(p.montant || 0), 0);

    const statusCounts: { [key: string]: number } = {};
    factures.forEach((f: any) => {
      statusCounts[f.statut] = (statusCounts[f.statut] || 0) + 1;
    });
    const devisEnCoursCount = devis.filter((d: any) => 
  ! ['En retard', 'Paiement Partiel', 'Payée'].includes(d.statut || 'En cours')
    ).length;
    this.factureStatusData = [
      { label: 'validée', count: devisEnCoursCount, color: '#3498db' },
      { label: 'Payée', count: statusCounts['Payée'] || 0, color: '#2ecc71' },
      { label: 'Paiement Partiel', count: statusCounts['Paiement Partiel'] || 0, color: '#f1c40f' },
      { label: 'En retard', count: statusCounts['En retard'] || 0, color: '#e74c3c' }
    ];

    const today = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    this.monthlyData = [];
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = months[monthDate.getMonth()];
      const amount = factures
        .filter((f: any) => {
          const emissionDate = new Date(f.dateEmission);
          return emissionDate.getFullYear() === monthDate.getFullYear() &&
                 emissionDate.getMonth() === monthDate.getMonth();
        })
        .reduce((sum: number, f: any) => sum + Number(f.montantTTC || 0), 0);
      this.monthlyData.push({ month: monthName, amount });
    }
    this.maxMonthlyAmount = Math.max(...this.monthlyData.map(m => m.amount), 1);

    this.alerts = [];
    factures.forEach((f: any) => {
      const echeance = new Date(f.echeance);
      const todayDate = new Date();
      const diffTime = echeance.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const client = clients.find((c: any) => c._id === f.client || c.nom === f.client);
      const clientName = client ? client.nom : 'Client inconnu';

      if (f.statut === 'En retard') {
        this.alerts.push({
          title: `Facture ${f.reference} en retard`,
          description: `Facture pour ${clientName} en retard de ${-diffDays} jour(s). Montant: ${f.montantTTC} EUR.`,
          priority: 'high',
          icon: '⚠️',
          factureId: f._id
        });
      } else if (diffDays <= 3 && diffDays >= 0 && f.statut !== 'Payée') {
        this.alerts.push({
          title: `Facture ${f.reference} à échéance proche`,
          description: `Facture pour ${clientName} due dans ${diffDays} jour(s). Montant: ${f.montantTTC} EUR.`,
          priority: 'medium',
          icon: '⏰',
          factureId: f._id
        });
      }
    });

    const newClients = clients.filter((c: any) => {
      const creationDate = new Date(c.createdAt || Date.now());
      const diffTime = Date.now() - creationDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    newClients.forEach((c: any) => {
      this.alerts.push({
        title: `Nouveau client ajouté`,
        description: `Client "${c.nom}" a été ajouté récemment.`,
        priority: 'low',
        icon: '🆕'
      });
    });
  }

  getPercentage(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
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
    if (alert.factureId) {
      this.router.navigate(['/factures', alert.factureId]);
    } else {
      alert('Détail alerte : ' + alert.title);
    }
  }
}