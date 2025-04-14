import { Component, OnInit } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-compte-list',
  templateUrl: './compte-list.component.html',
  styleUrls: ['./compte-list.component.css'],
})
export class CompteListComponent implements OnInit {
  comptes: CompteComptable[] = [];
  showForm: boolean = false;
  selectedCompte: CompteComptable | null = null;

  constructor(
    private compteService: CompteComptableService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadComptes();
  }

  loadComptes() {
    this.compteService.getComptes().subscribe({
      next: (data: CompteComptable[]) => {
        console.log('Comptes récupérés:', data);
        this.comptes = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des comptes:', err);
        this.snackBar.open('Erreur lors de la récupération des comptes.', 'Fermer', { duration: 5000 });
      },
    });
  }

  deleteCompte(id: string) {
    if (confirm('Voulez-vous vraiment supprimer ce compte ?')) {
      this.compteService.deleteCompte(id).subscribe({
        next: () => {
          this.snackBar.open('Compte supprimé avec succès !', 'Fermer', { duration: 3000 });
          this.loadComptes();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.snackBar.open('Erreur lors de la suppression du compte.', 'Fermer', { duration: 5000 });
        },
      });
    }
  }

  editCompte(compte: CompteComptable) {
    console.log('Modifier cliqué, compte:', compte);
    this.selectedCompte = { ...compte };
    this.showForm = true;
    console.log('showForm après Modifier:', this.showForm);
  }

  onCompteSaved(compte: CompteComptable) {
    console.log('Compte sauvegardé:', compte);
    this.showForm = false;
    this.selectedCompte = null;
    this.loadComptes();
  }
}
