import { Component } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Models/Utilisateur';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent {
  User: Utilisateur[] = [];
  errorMessage: string = '';

  constructor(private UserService: UtilisateurService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.UserService.getAllUsers().subscribe({
      next: (data) => {
        console.log('Utilisateurs reçus :', data);
        this.User = data;
        this.errorMessage = data.length === 0 ? 'Aucun utilisateur trouvé.' : '';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs. Vérifiez le serveur.';
      }
    });
  }

  deleteUser(id: string) {
    if (id) {
      this.UserService.deleteUser(id).subscribe({
        next: () => {
          console.log('Utilisateur supprimé avec succès, ID :', id);
          this.User = this.User.filter(user => user._id !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression :', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur.';
        }
      });
    }
  }
}