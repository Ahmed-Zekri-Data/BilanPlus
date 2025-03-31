// src/app/components/commandes/commandes.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service'; // Chemin corrigé
import { CommandeAchat } from '../../Models/CommandeAchat'; // Chemin corrigé
import { Produit } from '../../Models/Produit'; // Chemin corrigé
import { Fournisseur } from '../../Models/Fournisseur'; // Chemin corrigé
import { Router } from '@angular/router';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  commandes: CommandeAchat[] = [];
  produits: { [key: string]: Produit | undefined } = {};
  fournisseurs: { [key: string]: Fournisseur | undefined } = {};

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.apiService.getCommandes().subscribe({
      next: (data: CommandeAchat[]) => {
        this.commandes = data;
        console.log('Commandes chargées :', this.commandes);
        this.loadRelatedData();
      },
      error: (err: any) => console.error('Erreur lors du chargement des commandes:', err) // Type ajouté
    });
  }

  loadRelatedData(): void {
    this.commandes.forEach(commande => {
      if (!this.produits[commande.produit]) {
        this.apiService.getProduit(commande.produit).subscribe({
          next: (produit: Produit) => this.produits[commande.produit] = produit,
          error: (err: any) => console.error(`Erreur produit ${commande.produit}:`, err) // Type ajouté
        });
      }
      if (!this.fournisseurs[commande.fournisseurID]) {
        this.apiService.getFournisseur(commande.fournisseurID).subscribe({
          next: (fournisseur: Fournisseur) => this.fournisseurs[commande.fournisseurID] = fournisseur,
          error: (err: any) => console.error(`Erreur fournisseur ${commande.fournisseurID}:`, err) // Type ajouté
        });
      }
    });
  }

  addCommande(): void {
    this.router.navigate(['/add-commande']);
  }

  approuverCommande(id: string): void {
    this.apiService.updateStatut(id, 'Approuvé').subscribe({
      next: () => this.loadCommandes(),
      error: (err: any) => console.error('Erreur lors de l’approbation:', err) // Type ajouté
    });
  }

  deleteCommande(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      this.apiService.deleteCommande(id).subscribe({
        next: () => {
          this.commandes = this.commandes.filter(commande => commande._id !== id);
          console.log('Commande supprimée avec succès');
        },
        error: (err: any) => console.error('Erreur lors de la suppression:', err) // Type ajouté
      });
    }
  }
}