// src/app/components/fournisseurs/fournisseurs.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service'; // Chemin corrigé
import { Fournisseur } from '../../Models/Fournisseur'; // Chemin corrigé
import { Router } from '@angular/router';

@Component({
  selector: 'app-fournisseurs',
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.css']
})
export class FournisseursComponent implements OnInit {
  fournisseurs: Fournisseur[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    this.apiService.getFournisseurs().subscribe({
      next: (data: Fournisseur[]) => {
        this.fournisseurs = data;
        console.log('Fournisseurs chargés :', this.fournisseurs);
      },
      error: (err: any) => console.error('Erreur lors du chargement des fournisseurs:', err)
    });
  }

  addFournisseur(): void {
    this.router.navigate(['/add-fournisseur']);
  }

  deleteFournisseur(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
      this.apiService.deleteFournisseur(id).subscribe({
        next: () => {
          this.fournisseurs = this.fournisseurs.filter(fournisseur => fournisseur._id !== id);
          console.log('Fournisseur supprimé avec succès');
        },
        error: (err: any) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }
}