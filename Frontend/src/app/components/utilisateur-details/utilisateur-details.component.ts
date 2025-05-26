import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Models/Utilisateur';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-utilisateur-details',
  templateUrl: './utilisateur-details.component.html',
  styleUrls: ['./utilisateur-details.component.css']
})
export class UtilisateurDetailsComponent implements OnInit {
  utilisateur: Utilisateur | null = null;
  errorMessage: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID depuis les paramètres de l'URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getUtilisateurDetails(id); // Passer l'ID tel quel (chaîne)
    } else {
      this.errorMessage = 'ID d\'utilisateur non spécifié';
    }
  }

  getUtilisateurDetails(id: string): void {
    this.utilisateurService.getUserById(id).subscribe({ // Passer id comme string
      next: (data: Utilisateur) => {
        console.log('Détails récupérés:', data); // Log pour confirmer
        this.utilisateur = data;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la récupération des détails de l\'utilisateur';
        console.error('Erreur détails:', err); // Log erreur détaillé
        console.error('Statut:', err.status, 'Détails:', err.error); // Plus de détails
      }
    });
  }

  // Méthode pour retourner à la liste
  goBack(): void {
    this.router.navigate(['/utilisateurs']);
  }

  // Méthode pour aller à la page d'édition
  editUser(): void {
    if (this.utilisateur?._id) {
      this.router.navigate(['/utilisateur/edit', this.utilisateur._id]);
    }
  }
}