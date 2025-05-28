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
    this.UserService.deleteUser(id).subscribe(() => {
      this.User = this.User.filter(user => user._id !== id);
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