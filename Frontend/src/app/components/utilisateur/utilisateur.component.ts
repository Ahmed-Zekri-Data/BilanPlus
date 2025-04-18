import { Component } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Models/Utilisateur';
import { Router } from '@angular/router';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent {
  User: Utilisateur[] = [];

  constructor(private UserService: UtilisateurService, private router: Router) {}

  ngOnInit() {
    this.UserService.getAllUsers().subscribe(
      (data) => this.User = data
    );
  }

  deleteUser(id: string) {
    this.UserService.deleteUser(id).subscribe({
      next: () => {
        console.log('Utilisateur supprimé avec succès, ID:', id); // Log pour confirmer
        this.User = this.User.filter(user => user._id !== id); // Mise à jour de la liste
        console.log('Liste mise à jour:', this.User); // Log pour vérifier la liste
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err); // Log en cas d'erreur
        // Optionnel : Si le backend a quand même supprimé, mettre à jour localement
        this.User = this.User.filter(user => user._id !== id);
      }
    });
  }

  goToDetails(id: string) {
    this.router.navigate(['/utilisateur/details', id]);
  }

  goToAddUser() {
    this.router.navigate(['/utilisateur/add']);
  }

  // Méthode pour afficher le rôle de manière lisible
  getRoleDisplayName(role: string): string {
    if (role === 'admin') return 'Administrateur';
    if (role === 'user') return 'Utilisateur';
    return 'Non défini';
  }
}