import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utilisateur } from '../../Models/Utilisateur';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.scss']
})
export class UtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filteredUtilisateurs: Utilisateur[] = [];

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.utilisateurService.getAllUsers().subscribe({
      next: (data: Utilisateur[]) => {
        this.utilisateurs = data;
        this.filteredUtilisateurs = [...this.utilisateurs];
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUtilisateurs = [...this.utilisateurs];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredUtilisateurs = this.utilisateurs.filter(user => 
      user.nom.toLowerCase().includes(searchTermLower) ||
      user.prenom.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
  }

  editUser(id: string): void {
    this.router.navigate(['/users/edit', id]);
  }

  viewUser(id: string): void {
    this.router.navigate(['/users/view', id]);
  }

  deleteUser(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      this.utilisateurService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error: Error) => {
          this.error = error.message || 'Une erreur est survenue lors de la désactivation';
        }
      });
    }
  }

  exportCSV(): void {
    this.utilisateurService.exporterUtilisateursCSV().subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'utilisateurs.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: Error) => {
        this.error = error.message || 'Une erreur est survenue lors de l\'exportation';
      }
    });
  }
}