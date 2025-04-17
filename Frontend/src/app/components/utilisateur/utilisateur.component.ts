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

  constructor(private userService: UtilisateurService, private router: Router) {}

  ngOnInit() {
    this.userService.getAllUsers().subscribe(
      (data) => this.User = data
    );
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        console.log('Utilisateur supprimé avec succès, ID:', id);
        this.User = this.User.filter(user => user._id !== id);
        console.log('Liste mise à jour:', this.User);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        this.User = this.User.filter(user => user._id !== id);
      }
    });
  }

  viewUser(id: string) {
    this.router.navigate(['/utilisateur/details', id]);
  }

  editUser(id: string) {
    this.router.navigate(['/utilisateur/edit', id]);
  }

  goToAddUser() {
    this.router.navigate(['/utilisateur/add']);
  }

  // Méthode auxiliaire pour le template
  getRoleName(user: Utilisateur): string {
    if (!user.role) return 'N/A';
    return typeof user.role === 'string' ? user.role : (user.role.nom || 'N/A');
  }
}