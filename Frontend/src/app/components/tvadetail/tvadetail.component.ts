import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-tva-detail',
  templateUrl: './tvadetail.component.html',
  styleUrls: ['./tvadetail.component.css']
})
export class TvaDetailComponent implements OnInit {
  tva: TVA | null = null;
  declarations: DeclarationFiscale[] = [];
  errors: string[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTVADetails(id);
    } else {
      this.errors = ['ID de TVA non fourni'];
      this.isLoading = false;
    }
  }

  loadTVADetails(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getTVAById(id).subscribe({
      next: (tva) => {
        this.tva = tva;
        if (tva.declarations && Array.isArray(tva.declarations)) {
          // Filtrer pour ne garder que les objets DeclarationFiscale (pas les chaînes)
          this.declarations = tva.declarations
            .filter(decl => decl && typeof decl !== 'string')
            .map(decl => decl as DeclarationFiscale); // Cast explicite pour satisfaire TypeScript
        }
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    // Rediriger vers la page DFTVA avec l'onglet TVA sélectionné (index 2)
    this.router.navigate(['/DFTVA'], { queryParams: { tab: 2 } });
  }

  /**
   * Formate une période de déclaration (ex: "2025-05-01 - 2025-05-31") en format lisible (ex: "Mai 2025")
   * @param periode La période à formater
   * @returns La période formatée
   */
  formatPeriode(periode: string | undefined): string {
    if (!periode) return 'Période non spécifiée';

    try {
      // Extraire les dates de début et de fin
      const dates = periode.split(' - ');
      if (dates.length !== 2) return periode;

      const dateDebut = new Date(dates[0]);
      const dateFin = new Date(dates[1]);

      // Vérifier si les dates sont valides
      if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
        return periode;
      }

      // Vérifier si les dates sont dans le même mois et la même année
      if (dateDebut.getMonth() === dateFin.getMonth() && dateDebut.getFullYear() === dateFin.getFullYear()) {
        // Formater en "Mois Année"
        const mois = dateDebut.toLocaleString('fr-FR', { month: 'long' });
        const annee = dateDebut.getFullYear();
        return `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`;
      }

      // Si les dates couvrent plusieurs mois, formater en "Mois Année - Mois Année"
      const moisDebut = dateDebut.toLocaleString('fr-FR', { month: 'long' });
      const anneeDebut = dateDebut.getFullYear();
      const moisFin = dateFin.toLocaleString('fr-FR', { month: 'long' });
      const anneeFin = dateFin.getFullYear();

      return `${moisDebut.charAt(0).toUpperCase() + moisDebut.slice(1)} ${anneeDebut} - ${moisFin.charAt(0).toUpperCase() + moisFin.slice(1)} ${anneeFin}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la période:', error);
      return periode;
    }
  }
}