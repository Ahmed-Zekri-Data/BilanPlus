// src/app/add-commande/add-commande.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommandeAchat } from '../Models/CommandeAchat';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-commande',
  templateUrl: './add-commande.component.html',
  styleUrls: ['./add-commande.component.css']
})
export class AddCommandeComponent {
  nouvelleCommande: CommandeAchat = {
    produit: '67e74584494f0404728c2f16',
    quantite: 0,
    prix: 0,
    fournisseurID: '67db40ec0bf2c43bc1dc0f82'
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ajouterCommande(): void {
    this.apiService.createCommande(this.nouvelleCommande).subscribe({
      next: () => this.router.navigate(['/commandes']),
      error: (err) => console.error('Erreur lors de l’ajout:', err)
    });
  }

  annuler(): void {
    this.router.navigate(['/commandes']);
  }
}