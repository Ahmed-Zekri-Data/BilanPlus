import { Component, OnInit } from '@angular/core';
import { FiscalService } from '../../services/fiscal.service.service';

@Component({
  selector: 'app-fiscal-statistics',
  templateUrl: './fiscal-statistics.component.html',
  styleUrls: ['./fiscal-statistics.component.css']
})
export class FiscalStatisticsComponent implements OnInit {
  // Années disponibles
  availableYears: number[] = [];
  selectedYear: number = new Date().getFullYear();

  // Données pour les statistiques
  isLoading: boolean = false;
  error: string | null = null;
  fiscalData: any = null;

  // Données mensuelles
  monthlyData: any[] = [];

  // Données de comparaison annuelle (simulées)
  yearlyComparisonData: any = {
    years: [],
    tva: [],
    tcl: [],
    droitTimbre: []
  };

  constructor(private fiscalService: FiscalService) { }

  ngOnInit(): void {
    // Initialiser les années disponibles (3 dernières années)
    const currentYear = new Date().getFullYear();
    this.availableYears = [currentYear - 2, currentYear - 1, currentYear];
    this.selectedYear = currentYear;

    // Charger les données
    this.loadFiscalData();
  }

  onYearChange(): void {
    this.loadFiscalData();
  }

  loadFiscalData(): void {
    this.isLoading = true;
    this.error = null;

    this.fiscalService.getDashboardFiscal(this.selectedYear).subscribe({
      next: (response) => {
        if (response.success && response.data.dataAvailable) {
          this.fiscalData = response.data;

          // Afficher les données fiscales dans la console pour le débogage
          console.log('Données fiscales reçues:', this.fiscalData);

          // Initialiser les valeurs par défaut si elles ne sont pas définies
          if (this.fiscalData.totalTCL === undefined) {
            this.fiscalData.totalTCL = 0;
          }

          if (this.fiscalData.totalDroitTimbre === undefined) {
            this.fiscalData.totalDroitTimbre = 0;
          }

          this.monthlyData = response.data.indicateursMensuels;

          // Afficher les valeurs calculées pour le débogage
          console.log('TVA Amount:', this.getTVAAmount());
          console.log('TCL Amount:', this.getTCLAmount());
          console.log('Droit de Timbre Amount:', this.getDroitTimbreAmount());
          console.log('Total Charges Fiscales:', this.getTotalChargesFiscales());

          // Générer des données de comparaison annuelle simulées
          this.generateYearlyComparisonData();
        } else {
          this.error = 'Aucune donnée disponible pour l\'année sélectionnée';
          this.fiscalData = null;
          this.monthlyData = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données fiscales:', error);
        this.error = 'Une erreur est survenue lors du chargement des données';
        this.isLoading = false;
        this.fiscalData = null;
        this.monthlyData = [];
      }
    });
  }

  generateYearlyComparisonData(): void {
    // Simuler des données pour les années précédentes
    // Dans une implémentation réelle, ces données viendraient d'un appel API
    this.yearlyComparisonData = {
      years: this.availableYears,
      tva: this.availableYears.map(year => Math.random() * 50000 + 10000),
      tcl: this.availableYears.map(year => Math.random() * 5000 + 1000),
      droitTimbre: this.availableYears.map(year => Math.random() * 2000 + 500)
    };
  }

  // Calculer le total des charges fiscales
  getTotalChargesFiscales(): number {
    if (!this.fiscalData) return 0;

    // Utiliser directement totalChargesFiscales si disponible
    if (this.fiscalData.totalChargesFiscales !== undefined && this.fiscalData.totalChargesFiscales > 0) {
      return this.fiscalData.totalChargesFiscales;
    }

    // Sinon, calculer à partir des composants individuels
    const tvaTotalAmount = this.getTVAAmount();
    const tclAmount = this.getTCLAmount();
    const droitTimbreAmount = this.getDroitTimbreAmount();

    return tvaTotalAmount + tclAmount + droitTimbreAmount;
  }

  // Calculer le montant net de TVA
  getTVAAmount(): number {
    if (!this.fiscalData) return 0;

    // Si totalTVA est disponible, l'utiliser directement
    if (this.fiscalData.totalTVA !== undefined) {
      return this.fiscalData.totalTVA;
    }

    // Sinon, calculer à partir de TVA collectée et déductible
    return this.fiscalData.totalTVACollectee - this.fiscalData.totalTVADeductible > 0 ?
      this.fiscalData.totalTVACollectee - this.fiscalData.totalTVADeductible : 0;
  }

  // Calculer le montant de TCL
  getTCLAmount(): number {
    if (!this.fiscalData) return 0;

    return this.fiscalData.totalTCL || 0;
  }

  // Calculer le montant de Droit de Timbre
  getDroitTimbreAmount(): number {
    if (!this.fiscalData) return 0;

    return this.fiscalData.totalDroitTimbre || 0;
  }

  // Calculer le pourcentage de TVA par rapport au total des charges fiscales
  getTVAPercentage(): number {
    const totalCharges = this.getTotalChargesFiscales();
    if (totalCharges === 0) return 0;

    return (this.getTVAAmount() / totalCharges) * 100;
  }

  // Calculer le pourcentage de TCL par rapport au total des charges fiscales
  getTCLPercentage(): number {
    const totalCharges = this.getTotalChargesFiscales();
    if (totalCharges === 0) return 0;

    return (this.getTCLAmount() / totalCharges) * 100;
  }

  // Calculer le pourcentage de Droit de Timbre par rapport au total des charges fiscales
  getDroitTimbrePercentage(): number {
    const totalCharges = this.getTotalChargesFiscales();
    if (totalCharges === 0) return 0;

    return (this.getDroitTimbreAmount() / totalCharges) * 100;
  }

  // Trouver le mois avec le plus haut montant de TVA
  getHighestTVAMonth(): string {
    if (!this.monthlyData || this.monthlyData.length === 0) return '';

    let highestIndex = 0;
    let highestValue = this.monthlyData[0].soldeTVA;

    for (let i = 1; i < this.monthlyData.length; i++) {
      if (this.monthlyData[i].soldeTVA > highestValue) {
        highestValue = this.monthlyData[i].soldeTVA;
        highestIndex = i;
      }
    }

    return this.monthlyData[highestIndex].nomMois;
  }

  // Calculer la tendance de la TVA (en pourcentage d'augmentation/diminution)
  getTVATrend(): number {
    if (!this.monthlyData || this.monthlyData.length < 2) return 0;

    const lastMonth = this.monthlyData[this.monthlyData.length - 1].soldeTVA;
    const previousMonth = this.monthlyData[this.monthlyData.length - 2].soldeTVA;

    return previousMonth !== 0 ?
      ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
  }
}
