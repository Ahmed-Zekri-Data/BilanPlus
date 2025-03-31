// src/app/add-fournisseur/add-fournisseur.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Fournisseur } from '../Models/Fournisseur';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-fournisseur',
  templateUrl: './add-fournisseur.component.html',
  styleUrls: ['./add-fournisseur.component.css']
})
export class AddFournisseurComponent {
  nouveauFournisseur: Fournisseur = {
    nom: '',
    email: '',
    adresse: '',
    categorie: ''
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ajouterFournisseur(): void {
    this.apiService.addFournisseur(this.nouveauFournisseur).subscribe({
      next: () => this.router.navigate(['/fournisseurs']),
      error: (err) => console.error('Erreur lors de l’ajout:', err)
    });
  }

  annuler(): void {
    this.router.navigate(['/fournisseurs']);
  }
}