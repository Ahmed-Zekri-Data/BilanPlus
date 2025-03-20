import { Component, OnInit } from '@angular/core';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';

@Component({
  selector: 'app-compte-list',
  template: `
    <h2>Liste des comptes</h2>
    <button (click)="showForm = true; selectedCompte = null" *ngIf="!showForm">Ajouter un compte</button>
    <app-compte-form 
      *ngIf="showForm" 
      [compte]="selectedCompte || { numeroCompte: '', nom: '', type: 'actif', solde: 0 }"
      (saved)="onCompteSaved($event)"
      (cancelled)="showForm = false">
    </app-compte-form>
    <ul>
      <li *ngFor="let compte of comptes">
        {{ compte.numeroCompte }} - {{ compte.nom }} ({{ compte.type }}) - Solde: {{ compte.solde }}
        <button (click)="editCompte(compte)">Modifier</button>
        <button (click)="deleteCompte(compte._id!)">Supprimer</button>
      </li>
    </ul>
  `,
  styles: [`
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      padding: 10px;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    button {
      margin-left: 10px;
      padding: 5px 10px;
      cursor: pointer;
    }
  `]
})
export class CompteListComponent implements OnInit {
  comptes: CompteComptable[] = [];
  showForm: boolean = false;
  selectedCompte: CompteComptable | null = null;

  constructor(private compteService: CompteComptableService) {}

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
      }
    });
  }

  deleteCompte(id: string) {
    if (confirm('Voulez-vous vraiment supprimer ce compte ?')) {
      this.compteService.deleteCompte(id).subscribe({
        next: () => this.loadComptes(),
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }

  editCompte(compte: CompteComptable) {
    console.log('Modifier cliqué, compte:', compte); // Log ajouté
    this.selectedCompte = { ...compte };
    this.showForm = true;
    console.log('showForm après Modifier:', this.showForm); // Log ajouté
  }

  onCompteSaved(compte: CompteComptable) {
    console.log('Compte sauvegardé:', compte); // Log ajouté
    this.showForm = false;
    this.selectedCompte = null;
    this.loadComptes();
  }
}