import { Component, OnInit } from '@angular/core';
import { FiscalService } from '../../services/fiscal.service.service';

@Component({
  selector: 'app-fiscal-dashboard',
  templateUrl: './fiscal-dashboard.component.html',
  styleUrls: ['./fiscal-dashboard.component.css']
})
export class FiscalDashboardComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  isLoading: boolean = false;
  dashboardData: any = null;
  error: string | null = null;

  // Années pour lesquelles nous avons des données
  // Cette liste sera remplie dynamiquement à partir des données du backend
  availableYears: number[] = [];

  // Vérifie si des données sont disponibles pour une année donnée
  hasDataForYear(year: number): boolean {
    return this.availableYears.includes(year);
  }

  constructor(private fiscalService: FiscalService) { }

  ngOnInit(): void {
    // Charger les données pour l'année courante
    this.loadDashboardData();

    // Récupérer la liste des années disponibles
    this.loadAvailableYears();
  }

  // Méthode pour charger la liste des années disponibles
  loadAvailableYears(): void {
    this.fiscalService.getAvailableYears().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.availableYears = response.data;
          console.log('Années disponibles:', this.availableYears);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des années disponibles:', err);
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    this.dashboardData = null; // Réinitialiser les données pour montrer le chargement

    console.log(`Chargement des données pour l'année ${this.currentYear}`);

    // Appel à l'API réelle
    this.fiscalService.getDashboardFiscal(this.currentYear).subscribe({
      next: (response) => {
        if (response && response.data) {
          // Vérifier si des données sont disponibles pour cette année
          if (!response.data.dataAvailable) {
            console.log(`Aucune donnée disponible pour l'année ${this.currentYear}`);

            // Mettre à jour la liste des années disponibles
            if (response.data.anneesDisponibles) {
              this.availableYears = response.data.anneesDisponibles;
            }

            // Laisser dashboardData à null pour afficher le message "pas de données"
            this.isLoading = false;
            return;
          }

          // Des données sont disponibles
          this.dashboardData = response.data;
          console.log(`Données chargées pour l'année ${this.currentYear}:`, this.dashboardData);

          // Logs détaillés pour comprendre la source des différences
          console.log('Dashboard - Total Charges Fiscales:', this.dashboardData.resume.totalChargesFiscales);
          console.log('Dashboard - Détail des charges:');
          console.log('  - TVA (solde positif):', this.dashboardData.resume.soldeTVA > 0 ? this.dashboardData.resume.soldeTVA : 0);
          console.log('  - TCL:', this.dashboardData.resume.totalTCL);
          console.log('  - Droit de Timbre:', this.dashboardData.resume.totalDroitTimbre);

          // Calculer le total manuellement pour vérifier
          const calculManuel = (this.dashboardData.resume.soldeTVA > 0 ? this.dashboardData.resume.soldeTVA : 0) +
                              this.dashboardData.resume.totalTCL +
                              this.dashboardData.resume.totalDroitTimbre;
          console.log('Dashboard - Total calculé manuellement:', calculManuel);

          // Vérifier si les totaux sont cohérents
          if (this.dashboardData.resume.totalChargesFiscales !== calculManuel) {
            console.error('ERREUR: Incohérence détectée dans les totaux du dashboard!');
            console.error('  - Total dans dashboardData:', this.dashboardData.resume.totalChargesFiscales);
            console.error('  - Total calculé manuellement:', calculManuel);
            console.error('  - Différence:', this.dashboardData.resume.totalChargesFiscales - calculManuel);

            // Forcer la cohérence
            this.dashboardData.resume.totalChargesFiscales = calculManuel;
            console.log('  - Total corrigé:', this.dashboardData.resume.totalChargesFiscales);
          }
        } else {
          this.error = 'Format de réponse invalide';
          console.error('Format de réponse invalide:', response);
        }
      },
      error: (err) => {
        this.error = `Erreur lors du chargement des données pour l'année ${this.currentYear}: ${err.message || 'Erreur inconnue'}`;
        console.error('Erreur API:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  changeYear(year: number): void {
    // Vérifier que l'année est valide
    if (year < 2000 || year > 2100) {
      this.error = `L'année ${year} est en dehors de la plage autorisée (2000-2100)`;
      return;
    }

    // Ne rien faire si l'année est la même
    if (year === this.currentYear) {
      return;
    }

    console.log(`Changement d'année: ${this.currentYear} -> ${year}`);
    this.currentYear = year;
    this.loadDashboardData();
  }

  // Calculer le total des charges fiscales
  calculateTotalCharges(): number {
    if (!this.dashboardData || !this.dashboardData.resume) return 0;

    // Calculer directement avec la formule standard
    const soldeTVAPositif = this.dashboardData.resume.soldeTVA > 0 ? this.dashboardData.resume.soldeTVA : 0;
    const totalTCL = this.dashboardData.resume.totalTCL || 0;
    const totalDroitTimbre = this.dashboardData.resume.totalDroitTimbre || 0;

    return soldeTVAPositif + totalTCL + totalDroitTimbre;
  }
}
