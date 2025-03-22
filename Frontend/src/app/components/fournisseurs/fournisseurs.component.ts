import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Fournisseur } from '../../Models/Fournisseur';

@Component({
  selector: 'app-fournisseurs',
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.css']
})
export class FournisseursComponent implements OnInit {
  fournisseurs: Fournisseur[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    this.apiService.getFournisseurs().subscribe({
      next: (data: Fournisseur[]) => {
        this.fournisseurs = data;
        console.log('Fournisseurs chargés :', this.fournisseurs);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs:', err);
      }
    });
  }

  deleteFournisseur(_id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
      this.apiService.deleteFournisseur(_id).subscribe({
        next: () => {
          this.fournisseurs = this.fournisseurs.filter(f => f._id !== _id);
          console.log('Fournisseur supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }
}