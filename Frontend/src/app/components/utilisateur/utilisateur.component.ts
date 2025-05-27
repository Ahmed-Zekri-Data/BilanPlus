import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur, UtilisateurResponse } from '../../Models/Utilisateur';
import { Router } from '@angular/router';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  searchTerm: string = '';
  errorMessage: string | null = null;
  isToggling: boolean = false;

  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['utilisateur', 'role', 'telephone', 'dateCreation', 'statut', 'actions'];

  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (response: UtilisateurResponse) => {
        this.utilisateurs = response.utilisateurs;
        this.filteredUtilisateurs = response.utilisateurs;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        console.error('Erreur:', err);
      }
    });
  }

  search(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filteredUtilisateurs = this.utilisateurs.filter(user => {
      // Recherche dans le nom et l'email
      const nameMatch = user.nom.toLowerCase().includes(this.searchTerm);
      const emailMatch = user.email.toLowerCase().includes(this.searchTerm);

      // Recherche dans le rôle
      let roleMatch = false;
      const roleName = this.getRoleName(user).toLowerCase();
      roleMatch = roleName.includes(this.searchTerm);

      return nameMatch || emailMatch || roleMatch;
    });
  }

  addUtilisateur(): void {
    this.router.navigate(['/utilisateur/add']);
  }

  openShareDialog(user: Utilisateur): void {
    alert(`Partage des informations de ${user.nom} ${user.prenom || ''}`);
  }

  editUtilisateur(user: Utilisateur): void {
    this.router.navigate([`/utilisateur/edit/${user._id}`]);
  }

  deleteUtilisateur(id: string | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.loadUtilisateurs();
          // Afficher un message de succès
          alert('Utilisateur supprimé avec succès');
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Erreur lors de la suppression de l\'utilisateur.';
          console.error('Erreur:', err);
          // Afficher un message d'erreur
          alert('Erreur lors de la suppression de l\'utilisateur: ' + this.errorMessage);
        }
      });
    }
  }

  showDetails(user: Utilisateur): void {
    this.router.navigate([`/utilisateur/details/${user._id}`]);
  }

  getRoleName(user: Utilisateur): string {
    if (!user.role) {
      return 'Non défini';
    }

    // Si le rôle est une chaîne de caractères (ID), essayer de trouver le nom du rôle correspondant
    if (typeof user.role === 'string') {
      // Cas spécifiques pour les IDs de rôle connus
      switch (user.role) {
        case '1': return 'Administrateur Système';
        case '2': return 'Directeur Financier';
        case '3': return 'Comptable';
        case '4': return 'Contrôleur de Gestion';
        case '5': return 'Assistant Comptable';
        case '6': return 'Employé';
        case '7': return 'Auditeur';
        default: return `Rôle (${user.role})`;
      }
    }

    // Si le rôle est un objet, retourner son nom
    return user.role.nom;
  }

  getActiveUsers(): Utilisateur[] {
    return this.filteredUtilisateurs.filter(user => user.actif === true);
  }

  getInactiveUsers(): Utilisateur[] {
    return this.filteredUtilisateurs.filter(user => user.actif === false);
  }

  hasActiveUsers(): boolean {
    return this.getActiveUsers().length > 0;
  }

  hasInactiveUsers(): boolean {
    return this.getInactiveUsers().length > 0;
  }

  exportToCSV(): void {
    this.utilisateurService.exportToCSV().subscribe({
      next: (blob: Blob) => {
        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(blob);
        // Créer un élément a pour déclencher le téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = 'utilisateurs.csv';
        document.body.appendChild(a);
        a.click();
        // Nettoyer
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'exportation des utilisateurs.';
        console.error('Erreur lors de l\'exportation:', err);
        // Afficher un message d'erreur
        alert('Erreur lors de l\'exportation des utilisateurs: ' + (err.message || 'Erreur inconnue'));
      }
    });
  }

  // Nouvelle méthode pour formater la date
  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Nouvelle méthode pour toggle le statut utilisateur
  toggleUserStatus(user: Utilisateur): void {
    if (!user._id) {
      console.error('ID utilisateur manquant');
      return;
    }

    this.isToggling = true;
    const previousState = user.actif;

    console.log(`Changement de statut pour ${user.email} de ${user.actif} à ${!user.actif}`);

    // Optimistic update - mettre à jour l'interface immédiatement
    user.actif = !user.actif;

    // Appeler le service pour mettre à jour le backend
    this.utilisateurService.toggleUserStatus(user._id, user.actif).subscribe({
      next: (response) => {
        console.log('Statut utilisateur mis à jour avec succès:', response);
        this.isToggling = false;

        // Optionnel: afficher un message de succès
        // this.showSuccessMessage(`Utilisateur ${user.actif ? 'activé' : 'désactivé'} avec succès`);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);

        // Restaurer l'état précédent en cas d'erreur
        user.actif = previousState;
        this.isToggling = false;

        // Afficher un message d'erreur
        this.errorMessage = 'Erreur lors de la mise à jour du statut utilisateur';

        // Effacer le message d'erreur après 5 secondes
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      }
    });
  }

  // Méthodes pour le dashboard des statistiques
  getTotalUsers(): number {
    return this.utilisateurs.length;
  }

  getActiveUsersCount(): number {
    return this.utilisateurs.filter(user => user.actif === true).length;
  }

  getInactiveUsersCount(): number {
    return this.utilisateurs.filter(user => user.actif === false).length;
  }

  getRecentUsersCount(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.utilisateurs.filter(user => {
      if (!user.dateCreation) return false;
      const userDate = typeof user.dateCreation === 'string' ? new Date(user.dateCreation) : user.dateCreation;
      return userDate >= thirtyDaysAgo;
    }).length;
  }

  getRolesDistribution(): any[] {
    const roleCount: { [key: string]: number } = {};
    const total = this.utilisateurs.length;

    // Compter les utilisateurs par rôle
    this.utilisateurs.forEach(user => {
      const roleName = this.getRoleName(user);
      roleCount[roleName] = (roleCount[roleName] || 0) + 1;
    });

    // Convertir en tableau avec pourcentages
    return Object.entries(roleCount).map(([role, count]) => ({
      role,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count); // Trier par nombre décroissant
  }
}