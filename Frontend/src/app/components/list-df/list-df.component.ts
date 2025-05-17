import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GenerateDeclarationDialogComponent } from '../generate-declaration-dialog/generate-declaration-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-list-df',
  templateUrl: './list-df.component.html',
  styleUrls: ['./list-df.component.css']
})
export class ListDFComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  declarations: any= [];
  dataSource = new MatTableDataSource(this.declarations);
  displayedColumns: string[] = ['periode', 'type','montantTotal', 'totalTVACollectee', 'totalTVADeductible', 'totalTVADue', 'statut', 'actions'];
  isLoading: boolean = true;
  errors: string[] = [];


  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDeclarations();
  }
  ngAfterViewInit(): void {
    // Important : assigner paginator & sort ici
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    }

  loadDeclarations(): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations: any) => {
        this.declarations = declarations;
        this.dataSource.data = this.declarations;
        this.dataSource.sort = this.sort;

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
    this.router.navigate(['/get-declaration', id]);
  }

  editDeclaration(id: string): void {
    this.router.navigate(['/edit-declaration', id]);
  }

  deleteDeclaration(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
        next: () => {
          this.snackBar.open('Déclaration supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadDeclarations();
        },
        error: (errors: string[]) => {
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }


  addDeclaration(): void {
    const dialogRef = this.dialog.open(GenerateDeclarationDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.declarationFiscaleTVAService.generateDeclaration(result).subscribe({
          next: (declaration) => {
            this.snackBar.open('Déclaration générée avec succès', 'Fermer', { duration: 3000 });
            this.loadDeclarations();
          },
          error: (errors: string[]) => {
            this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Formate une période de déclaration (ex: "2025-05-01 - 2025-05-31") en format lisible (ex: "Mai 2025")
   * @param periode La période à formater
   * @returns La période formatée
   */
  formatPeriode(periode: string): string {
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