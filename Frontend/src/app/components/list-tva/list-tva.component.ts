import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GenerateTvaDialogComponent } from '../generate-tva-dialog/generate-tva-dialog.component';

@Component({
  selector: 'app-list-tva',
  templateUrl: './list-tva.component.html',
  styleUrls: ['./list-tva.component.css']
})
export class ListTVAComponent implements OnInit, AfterViewInit {
  tvaList: TVA[] = [];
  displayedColumns: string[] = ['taux', 'montant', 'declaration', 'actions'];
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<TVA>([]);
  errors: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTVAList();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTVAList(): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getAllTVA().subscribe({
      next: (tvaList) => {
        this.tvaList = tvaList;
        this.dataSource.data = this.tvaList; // Mettre à jour les données de dataSource
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  viewDetails(id: string): void {
    // Sauvegarder l'état actuel dans le localStorage pour pouvoir y revenir
    localStorage.setItem('returnToTVATab', 'true');
    this.router.navigate(['/get-tva', id]);
  }

  editTVA(id: string): void {
    // Sauvegarder l'état actuel dans le localStorage pour pouvoir y revenir
    localStorage.setItem('returnToTVATab', 'true');
    this.router.navigate(['/edit-tva', id]);
  }

  deleteTVA(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette TVA ?')) {
      this.declarationFiscaleTVAService.deleteTVA(id).subscribe({
        next: () => {
          this.snackBar.open('TVA supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadTVAList();
        },
        error: (errors: string[]) => {
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  addTVA(): void {
    const dialogRef = this.dialog.open(GenerateTvaDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajouter la TVA
        this.declarationFiscaleTVAService.addTVA(result).subscribe({
          next: () => {
            this.snackBar.open('TVA ajoutée avec succès ! La liste a été mise à jour.', 'Fermer', { duration: 3000 });
            this.loadTVAList(); // Recharger la liste
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout de la TVA:', error);
            let errorMessage = 'Erreur lors de l\'ajout de la TVA';

            if (error.error && error.error.errors) {
              // Formater les erreurs pour une meilleure lisibilité
              if (Array.isArray(error.error.errors)) {
                errorMessage = 'Veuillez corriger les erreurs suivantes :';
                error.error.errors.forEach((err: string) => {
                  errorMessage += `\n- ${err}`;
                });
              } else {
                errorMessage = error.error.errors;
              }
            } else if (error.error && error.error.message) {
              errorMessage = `Erreur : ${error.error.message}`;
            }

            // Ajouter des conseils spécifiques selon le type d'erreur
            if (errorMessage.toLowerCase().includes('taux')) {
              errorMessage += '\n\nConseil : Le taux de TVA doit être un nombre positif entre 0 et 100%.';
            }
            if (errorMessage.toLowerCase().includes('montant')) {
              errorMessage += '\n\nConseil : Le montant de TVA doit être un nombre positif.';
            }
            if (errorMessage.toLowerCase().includes('déclaration') || errorMessage.toLowerCase().includes('declaration')) {
              errorMessage += '\n\nConseil : Vérifiez que la déclaration fiscale sélectionnée existe bien.';
            }

            this.snackBar.open(errorMessage, 'Fermer', { duration: 8000 });
          }
        });
      }
    });
  }

  /**
   * Vérifie si une déclaration est un objet (et non une chaîne de caractères)
   * @param decl La déclaration à vérifier
   * @returns true si c'est un objet, false sinon
   */
  isDeclarationObject(decl: any): boolean {
    return decl !== null && typeof decl === 'object';
  }

  /**
   * Récupère la période d'une déclaration de manière sécurisée
   * @param decl La déclaration
   * @returns La période ou undefined si non disponible
   */
  getDeclarationPeriode(decl: any): string | undefined {
    if (this.isDeclarationObject(decl) && 'periode' in decl) {
      return decl.periode as string;
    }
    return undefined;
  }

  /**
   * Génère un texte pour l'infobulle d'une déclaration
   * @param decl La déclaration
   * @returns Le texte de l'infobulle
   */
  getDeclarationTooltip(decl: any): string {
    if (this.isDeclarationObject(decl)) {
      if ('periode' in decl && decl.periode) {
        return decl.periode as string;
      }
      if ('_id' in decl) {
        return `Déclaration ID: ${decl._id}`;
      }
      return 'Déclaration sans période';
    }
    return String(decl);
  }

  /**
   * Formate l'affichage d'une déclaration pour la liste
   * @param decl La déclaration
   * @returns Le texte formaté pour l'affichage
   */
  formatDeclarationDisplay(decl: any): string {
    if (this.isDeclarationObject(decl)) {
      const periode = this.getDeclarationPeriode(decl);
      if (periode) {
        return this.formatPeriode(periode);
      }
      return 'Déclaration sans période';
    }
    return String(decl);
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