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
    // Charger les années disponibles depuis le service
    this.fiscalService.getAvailableYears().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.availableYears = response.data;
          console.log('Années disponibles:', this.availableYears);

          // Sélectionner la première année disponible
          if (this.availableYears.length > 0) {
            this.selectedYear = this.availableYears[0];

            // Charger les données pour l'année sélectionnée
            this.loadFiscalData();
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des années disponibles:', err);
        this.error = 'Erreur lors du chargement des années disponibles';
      }
    });
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
          // Récupérer les données du résumé fiscal
          if (response.data.resume) {
            this.fiscalData = { ...response.data.resume };
          } else {
            this.fiscalData = { ...response.data };
          }

          // Afficher les données fiscales dans la console pour le débogage
          console.log('Données fiscales reçues (brut):', response.data);
          console.log('Données fiscales traitées:', this.fiscalData);

          // Initialiser les valeurs par défaut si elles ne sont pas définies
          if (this.fiscalData.totalTVACollectee === undefined) {
            this.fiscalData.totalTVACollectee = 0;
          }

          if (this.fiscalData.totalTVADeductible === undefined) {
            this.fiscalData.totalTVADeductible = 0;
          }

          if (this.fiscalData.soldeTVA === undefined) {
            this.fiscalData.soldeTVA = this.fiscalData.totalTVACollectee - this.fiscalData.totalTVADeductible;
          }

          if (this.fiscalData.totalTCL === undefined) {
            this.fiscalData.totalTCL = 0;
          }

          if (this.fiscalData.totalDroitTimbre === undefined) {
            this.fiscalData.totalDroitTimbre = 0;
          }

          // Recalculer le total des charges fiscales pour assurer la cohérence
          const soldeTVA = this.fiscalData.soldeTVA > 0 ? this.fiscalData.soldeTVA : 0;
          this.fiscalData.totalChargesFiscales = soldeTVA + this.fiscalData.totalTCL + this.fiscalData.totalDroitTimbre;

          this.monthlyData = response.data.indicateursMensuels || [];

          // Afficher les valeurs calculées pour le débogage
          console.log('Statistics - TVA Amount:', this.getTVAAmount());
          console.log('Statistics - TCL Amount:', this.getTCLAmount());
          console.log('Statistics - Droit de Timbre Amount:', this.getDroitTimbreAmount());
          console.log('Statistics - Total Charges Fiscales:', this.getTotalChargesFiscales());
          console.log('Statistics - Total Charges Fiscales (direct):', this.fiscalData.totalChargesFiscales);

          // Logs détaillés pour comprendre la source des différences
          console.log('Statistics - Détail des données:');
          console.log('  - totalTVACollectee:', this.fiscalData.totalTVACollectee);
          console.log('  - totalTVADeductible:', this.fiscalData.totalTVADeductible);
          console.log('  - soldeTVA:', this.fiscalData.soldeTVA);
          console.log('  - soldeTVA positif:', this.fiscalData.soldeTVA > 0 ? this.fiscalData.soldeTVA : 0);
          console.log('  - soldeTVAPositif:', this.fiscalData.soldeTVAPositif);
          console.log('  - totalTCL:', this.fiscalData.totalTCL);
          console.log('  - totalDroitTimbre:', this.fiscalData.totalDroitTimbre);
          console.log('  - totalChargesFiscales (direct):', this.fiscalData.totalChargesFiscales);

          // Calculer le total manuellement pour vérifier
          const calculManuel = (this.fiscalData.soldeTVA > 0 ? this.fiscalData.soldeTVA : 0) +
                              this.fiscalData.totalTCL +
                              this.fiscalData.totalDroitTimbre;
          console.log('Statistics - Total calculé manuellement:', calculManuel);

          // Vérifier les valeurs retournées par les méthodes
          console.log('Statistics - Valeurs retournées par les méthodes:');
          console.log('  - getTVAAmount():', this.getTVAAmount());
          console.log('  - getTCLAmount():', this.getTCLAmount());
          console.log('  - getDroitTimbreAmount():', this.getDroitTimbreAmount());
          console.log('  - getTVAPercentage():', this.getTVAPercentage());
          console.log('  - getTCLPercentage():', this.getTCLPercentage());
          console.log('  - getDroitTimbrePercentage():', this.getDroitTimbrePercentage());

          // Vérifier si les totaux sont cohérents
          if (this.fiscalData.totalChargesFiscales !== calculManuel) {
            console.error('ERREUR: Incohérence détectée dans les totaux!');
            console.error('  - Total dans fiscalData:', this.fiscalData.totalChargesFiscales);
            console.error('  - Total calculé manuellement:', calculManuel);
            console.error('  - Différence:', this.fiscalData.totalChargesFiscales - calculManuel);

            // Forcer la cohérence
            this.fiscalData.totalChargesFiscales = calculManuel;
            console.log('  - Total corrigé:', this.fiscalData.totalChargesFiscales);
          }

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
    // Utiliser uniquement les données réelles pour l'année sélectionnée
    // Ne pas générer de données fictives pour les autres années

    // Récupérer uniquement l'année actuelle
    const currentYear = this.selectedYear;

    // Créer un tableau avec uniquement l'année actuelle
    const years = [currentYear];

    // Utiliser les valeurs réelles pour l'année actuelle
    const tva = [this.getTVAAmount()];
    const tcl = [this.getTCLAmount()];
    const droitTimbre = [this.getDroitTimbreAmount()];

    this.yearlyComparisonData = {
      years: years,
      tva: tva,
      tcl: tcl,
      droitTimbre: droitTimbre
    };

    console.log('Données de comparaison annuelle (réelles):', this.yearlyComparisonData);
  }

  // Calculer le total des charges fiscales
  getTotalChargesFiscales(): number {
    if (!this.fiscalData) return 0;

    // Calculer directement avec la formule standard
    const soldeTVAPositif = this.fiscalData.soldeTVA > 0 ? this.fiscalData.soldeTVA : 0;
    const totalTCL = this.fiscalData.totalTCL || 0;
    const totalDroitTimbre = this.fiscalData.totalDroitTimbre || 0;

    return soldeTVAPositif + totalTCL + totalDroitTimbre;
  }

  // Calculer le montant net de TVA (uniquement la partie positive)
  getTVAAmount(): number {
    if (!this.fiscalData || !this.fiscalData.soldeTVA) return 0;

    // Uniquement la partie positive du solde TVA
    return this.fiscalData.soldeTVA > 0 ? this.fiscalData.soldeTVA : 0;
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
