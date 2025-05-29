import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandesService, CommandeAchat } from '../../../services/commandes.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-commande-view',
  templateUrl: './commande-view.component.html',
  styleUrls: ['./commande-view.component.css']
})
export class CommandeViewComponent implements OnInit {
  commande: CommandeAchat | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandesService: CommandesService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCommande(id);
    }
  }

  calculateDuree(): number {
    if (this.commande?.createdAt && this.commande?.date_fin) {
      const dateDebut = new Date(this.commande.createdAt);
      const dateFin = new Date(this.commande.date_fin);
      const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  loadCommande(id: string): void {
    this.isLoading = true;
    this.commandesService.getCommandeById(id).subscribe({
      next: (commande) => {
        this.commande = commande;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement de la commande', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  editCommande(): void {
    if (this.commande) {
      this.router.navigate(['/commandes/edit', this.commande._id]);
    }
  }

  deleteCommande(): void {
    if (this.commande && confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.commandesService.deleteCommande(this.commande._id!).subscribe({
        next: () => {
          this.snackBar.open('Commande supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/commandes']);
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

  goBack(): void {
    this.router.navigate(['/commandes']);
  }
} 