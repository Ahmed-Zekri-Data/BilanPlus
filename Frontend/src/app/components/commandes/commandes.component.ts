import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommandeAchat } from 'src/app/Models/CommandeAchat';
import { Produit } from 'src/app/Models/Produit';
import { Fournisseur } from 'src/app/Models/Fournisseur';
@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  commandes: CommandeAchat[] = [];
  produits: { [key: string]: Produit | undefined } = {};
  fournisseurs: { [key: string]: Fournisseur | undefined } = {};

  constructor(private apiService: ApiService) {}

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
      error: (err) => {
        console.error('Erreur lors du chargement des commandes:', err);
      }
    });
  }

  loadRelatedData(): void {
    this.commandes.forEach(commande => {
      if (!this.produits[commande.produit]) {
        this.apiService.getProduit(commande.produit).subscribe({
          next: (produit: Produit) => {
            this.produits[commande.produit] = produit;
          },
          error: (err) => console.error(`Erreur produit ${commande.produit}:`, err)
        });
      }
      if (!this.fournisseurs[commande.fournisseurID]) {
        this.apiService.getFournisseur(commande.fournisseurID).subscribe({
          next: (fournisseur: Fournisseur) => {
            this.fournisseurs[commande.fournisseurID] = fournisseur;
          },
          error: (err) => console.error(`Erreur fournisseur ${commande.fournisseurID}:`, err)
        });
      }
    });
  }

  deleteCommande(_id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      this.apiService.deleteCommande(_id).subscribe({
        next: () => {
          this.commandes = this.commandes.filter(c => c._id !== _id); // Corrigé ici
          console.log('Commande supprimée avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }
}