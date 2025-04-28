import { Component, OnInit } from '@angular/core';
import { CommandesService, CommandeAchat } from '../../../services/commandes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-commandes',
  templateUrl: './list-commandes.component.html',
  styleUrls: ['./list-commandes.component.css']
})
export class ListCommandesComponent implements OnInit {
  commandes: CommandeAchat[] = [];
  isLoading = false;
  displayedColumns: string[] = ['produit', 'quantite', 'prix', 'statut', 'fournisseurID', 'actions'];

  constructor(
    private commandesService: CommandesService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.isLoading = true;
    this.commandesService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  editCommande(id: string): void {
    this.router.navigate(['/commandes/edit', id]);
  }

  viewCommande(id: string): void {
    this.router.navigate(['/commandes/view', id]);
  }

  deleteCommande(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.commandesService.deleteCommande(id).subscribe({
        next: () => {
          this.snackBar.open('Commande supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadCommandes();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression de la commande', 'Fermer', {
            duration: 3000
          });
          console.error(err);
        }
      });
    }
  }

  addCommande(): void {
    this.router.navigate(['/commandes/add']);
  }
} 