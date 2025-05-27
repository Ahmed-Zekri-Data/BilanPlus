import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})
export class ReportingComponent implements OnInit {
  // Déclaration des données
  public reportData: any[] = []; // Tableau de données pour afficher les rapports
  public filters: any = {
    dateFrom: null,
    dateTo: null,
    status: ''
  };
  public selectedTab: string = 'tab1'; // Onglet sélectionné par défaut

  // Constructor pour l'injection des services si nécessaire
  constructor() {}

  // Initialisation des composants et des données
  ngOnInit(): void {
    this.loadReportData();
  }

  // Fonction pour charger les données du rapport (simulé ici)
  loadReportData(): void {
    // Simuler une récupération des données (remplacer avec un appel API réel)
    this.reportData = [
      { id: 1, name: 'Report 1', status: 'completed', date: new Date() },
      { id: 2, name: 'Report 2', status: 'pending', date: new Date() },
      { id: 3, name: 'Report 3', status: 'in-progress', date: new Date() }
    ];
  }

  // Fonction pour appliquer les filtres
  applyFilters(): void {
    // Ajouter la logique pour filtrer les données en fonction des critères (ici juste un exemple)
    console.log('Filtres appliqués:', this.filters);
    // Appeler une fonction qui filtre les données, par exemple avec un service
    this.reportData = this.reportData.filter(report => {
      const matchesDate = this.filters.dateFrom && this.filters.dateTo ?
        new Date(report.date) >= new Date(this.filters.dateFrom) && new Date(report.date) <= new Date(this.filters.dateTo) : true;
      const matchesStatus = this.filters.status ? report.status === this.filters.status : true;
      return matchesDate && matchesStatus;
    });
  }

  // Fonction pour gérer le changement d'onglet
  changeTab(tab: string): void {
    this.selectedTab = tab;
  }

  // Fonction pour exporter les données en CSV (exemple simple)
  exportToCSV(): void {
    const csvData = this.convertToCSV(this.reportData);
    this.downloadCSV(csvData);
  }

  // Fonction pour convertir les données au format CSV
  convertToCSV(data: any[]): string {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(report => Object.values(report).join(',')).join('\n');
    return `${header}\n${rows}`;
  }

  // Fonction pour télécharger le fichier CSV
  downloadCSV(csvData: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
