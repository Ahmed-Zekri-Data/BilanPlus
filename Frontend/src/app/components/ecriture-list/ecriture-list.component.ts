import { Component, OnInit } from '@angular/core';
import { EcritureComptableService } from '../../ecriture-comptable.service';
import { EcritureComptable, LigneEcriture } from '../../Models/EcritureComptable';

@Component({
  selector: 'app-ecriture-list',
  template: `
    <h2>Liste des écritures comptables</h2>
    <button (click)="showForm = true; selectedEcriture = null" *ngIf="!showForm">Ajouter une écriture</button>
    <ul>
      <li *ngFor="let ecriture of ecritures">
        {{ ecriture.date | date:'medium' }} - {{ ecriture.libelle }}
        <ul>
          <li *ngFor="let ligne of ecriture.lignes">
            {{ ligne.nature | titlecase }}: Compte {{ ligne.compte }} ({{ ligne.montant }})
          </li>
        </ul>
        <button (click)="editEcriture(ecriture)">Modifier</button>
        <button (click)="deleteEcriture(ecriture._id!)">Supprimer</button>
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
    ul ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    button {
      margin-left: 10px;
      padding: 5px 10px;
      cursor: pointer;
    }
  `]
})
export class EcritureListComponent implements OnInit {
  ecritures: EcritureComptable[] = [];
  showForm: boolean = false;
  selectedEcriture: EcritureComptable | null = null;

  constructor(private ecritureService: EcritureComptableService) {}

  ngOnInit() {
    this.loadEcritures();
  }

  loadEcritures() {
    this.ecritureService.getEcritures().subscribe({
      next: (data: EcritureComptable[]) => {
        console.log('Écritures récupérées:', data);
        this.ecritures = data;
      },
      error: (err) => console.error('Erreur lors de la récupération des écritures:', err)
    });
  }

  deleteEcriture(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette écriture ?')) {
      this.ecritureService.deleteEcriture(id).subscribe({
        next: () => this.loadEcritures(),
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }

  editEcriture(ecriture: EcritureComptable) {
    this.selectedEcriture = { ...ecriture };
    this.showForm = true;
  }
  onEcritureSaved(ecriture: EcritureComptable) {
    this.showForm = false;
    this.selectedEcriture = null;
    this.loadEcritures();
  }
}