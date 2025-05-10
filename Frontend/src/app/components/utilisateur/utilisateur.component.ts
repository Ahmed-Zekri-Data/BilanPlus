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
    this.filteredUtilisateurs = this.utilisateurs.filter(user =>
      user.nom.toLowerCase().includes(this.searchTerm) ||
      user.email.toLowerCase().includes(this.searchTerm) ||
      (typeof user.role === 'string' ? user.role.toLowerCase().includes(this.searchTerm) : user.role.nom.toLowerCase().includes(this.searchTerm))
    );
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
    if (id && confirm('Êtes-vous sûr ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => this.loadUtilisateurs(),
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur.';
          console.error('Erreur:', err);
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
    return typeof user.role === 'string' ? user.role : user.role.nom;
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
    const csvData = this.utilisateurs.map(user => ({
      Nom: user.nom,
      Prenom: user.prenom || '',
      Email: user.email,
      Role: typeof user.role === 'string' ? user.role : user.role.nom,
      Actif: user.actif ? 'Oui' : 'Non'
    }));
    const csv = [
      'Nom,Prenom,Email,Role,Actif',
      ...csvData.map(row => `${row.Nom},${row.Prenom},${row.Email},${row.Role},${row.Actif}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}