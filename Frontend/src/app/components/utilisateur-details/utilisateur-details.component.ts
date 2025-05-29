import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-utilisateur-details',
  templateUrl: './utilisateur-details.component.html',
  styleUrls: ['./utilisateur-details.component.css']
})
export class UtilisateurDetailsComponent implements OnInit {
  utilisateur: any = null;
  loading = false;
  error = '';


  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUtilisateur(id);
    } else {
      // Si aucun ID n'est fourni, charger les données de l'utilisateur connecté
      this.loadCurrentUser();
    }
  }

  loadCurrentUser(): void {
    this.loading = true;
    console.log('UtilisateurDetailsComponent: Chargement des données de l\'utilisateur connecté');
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('UtilisateurDetailsComponent: Données utilisateur reçues:', user);
        this.utilisateur = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('UtilisateurDetailsComponent: Erreur lors du chargement des données utilisateur:', err);
        this.error = err?.message || 'Erreur lors du chargement de l\'utilisateur.';
        this.loading = false;
      }
    });
  }

  loadUtilisateur(id: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (response) => {
        this.utilisateur = response.utilisateur;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement de l\'utilisateur.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    // Utiliser l'API History pour revenir à la page précédente
    window.history.back();
  }

  getRoleName(): string {
    if (!this.utilisateur) {
      return 'Non défini';
    }

    if (!this.utilisateur.role) {
      return 'Non défini';
    }

    // Si le rôle est une chaîne de caractères (ID), essayer de trouver le nom du rôle correspondant
    if (typeof this.utilisateur.role === 'string') {
      // Cas spécifiques pour les IDs de rôle connus
      switch (this.utilisateur.role) {
        case '1': return 'Administrateur Système';
        case '2': return 'Directeur Financier';
        case '3': return 'Comptable';
        case '4': return 'Contrôleur de Gestion';
        case '5': return 'Assistant Comptable';
        case '6': return 'Employé';
        case '7': return 'Auditeur';
        default: return `Rôle (${this.utilisateur.role})`;
      }
    }

    // Si le rôle est un objet avec une propriété nom
    if (typeof this.utilisateur.role === 'object' && this.utilisateur.role !== null) {
      if ('nom' in this.utilisateur.role) {
        return this.utilisateur.role.nom;
      }

      // Si le rôle est un objet sans propriété nom, retourner sa représentation JSON
      return JSON.stringify(this.utilisateur.role);
    }

    // Cas par défaut
    return 'Non défini';
  }

  // Méthodes de suppression retirées pour simplifier l'interface utilisateur

  // Méthode resetLoginAttempts retirée car la section sécurité a été supprimée
}