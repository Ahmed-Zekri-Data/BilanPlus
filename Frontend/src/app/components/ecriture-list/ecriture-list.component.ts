import { Component, OnInit } from '@angular/core';
import { EcritureComptableService } from '../../ecriture-comptable.service';
import { EcritureComptable } from '../../Models/EcritureComptable';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ecriture-list',
  templateUrl: './ecriture-list.component.html',
  styleUrls: ['./ecriture-list.component.css'],
})
export class EcritureListComponent implements OnInit {
  ecritures: EcritureComptable[] = [];
  showForm: boolean = false;
  selectedEcriture: EcritureComptable | null = null;

  constructor(
    private ecritureService: EcritureComptableService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEcritures();
  }

  loadEcritures(): void {
    this.ecritureService.getEcritures().subscribe({
      next: (ecritures) => {
        this.ecritures = ecritures;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des écritures:', err);
        this.snackBar.open('Erreur lors de la récupération des écritures.', 'Fermer', { duration: 5000 });
      },
    });
  }

  deleteEcriture(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette écriture ?')) {
      this.ecritureService.deleteEcriture(id).subscribe({
        next: () => {
          this.snackBar.open('Écriture supprimée avec succès !', 'Fermer', { duration: 3000 });
          this.loadEcritures();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l’écriture:', err);
          this.snackBar.open('Erreur lors de la suppression de l’écriture.', 'Fermer', { duration: 5000 });
        },
      });
    }
  }

  editEcriture(ecriture: EcritureComptable): void {
    this.selectedEcriture = { ...ecriture };
    this.showForm = true;
  }

  onEcritureSaved(ecriture: EcritureComptable): void {
    this.showForm = false;
    this.selectedEcriture = null;
    this.loadEcritures();
  }

  onEcritureCancelled(): void {
    this.showForm = false;
    this.selectedEcriture = null;
  }

  getTotalEcriture(ecriture: EcritureComptable): number {
    return ecriture.lignes.reduce((total, ligne) => total + ligne.montant, 0);
  }
}
