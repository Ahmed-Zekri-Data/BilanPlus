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

  loadCommande(id: string): void {
    this.isLoading = true;
    this.commandesService.getCommandeById(id).subscribe({
      next: (data) => {
        this.commande = data;
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
    if (this.commande?._id) {
      this.router.navigate(['/commandes/edit', this.commande._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/commandes']);
  }
} 