import { Component, OnInit } from '@angular/core';
import { FournisseurService, Fournisseur } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-fournisseurs',
  templateUrl: './list-fournisseurs.component.html',
  styleUrls: ['./list-fournisseurs.component.css']
})
export class ListFournisseursComponent implements OnInit {
  fournisseurs: Fournisseur[] = [];
  isLoading = false;
  displayedColumns: string[] = ['nom', 'email', 'adresse', 'categorie', 'actions'];

  constructor(
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    this.isLoading = true;
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (data) => {
        this.fournisseurs = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  editFournisseur(id: number): void {
    this.router.navigate(['/fournisseurs/edit', id]);
  }

  viewFournisseur(id: number): void {
    this.router.navigate(['/fournisseurs/view', id]);
  }

  deleteFournisseur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          this.snackBar.open('Fournisseur supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadFournisseurs();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression du fournisseur', 'Fermer', {
            duration: 3000
          });
          console.error(err);
        }
      });
    }
  }

  addFournisseur(): void {
    this.router.navigate(['/fournisseurs/add']);
  }
} 