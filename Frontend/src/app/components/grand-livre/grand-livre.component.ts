import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GrandLivreService } from '../../services/grand-livre.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { CompteComptable } from '../../Models/CompteComptable';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-grand-livre',
  templateUrl: './grand-livre.component.html',
  styleUrls: ['./grand-livre.component.css']
})
export class GrandLivreComponent implements OnInit {
  grandLivre: any[] = [];
  comptes: CompteComptable[] = [];
  filtreForm: FormGroup;
  isLoading = false;

  constructor(
    private grandLivreService: GrandLivreService,
    private compteService: CompteComptableService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filtreForm = this.fb.group({
      compteId: [''],
      dateDebut: [''],
      dateFin: ['']
    });
  }

  ngOnInit(): void {
    this.chargerComptes();
    this.chargerGrandLivre();
  }

  chargerComptes(): void {
    this.compteService.getComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des comptes', 'Fermer', {
          duration: 3000
        });
        console.error(err);
      }
    });
  }

  chargerGrandLivre(): void {
    this.isLoading = true;
    const filters = this.filtreForm.value;

    this.grandLivreService.getGrandLivre(
      filters.compteId,
      filters.dateDebut,
      filters.dateFin
    ).subscribe({
      next: (data) => {
        this.grandLivre = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement du grand livre', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  appliquerFiltres(): void {
    this.chargerGrandLivre();
  }

  reinitialiserFiltres(): void {
    this.filtreForm.reset();
    this.chargerGrandLivre();
  }
}
