import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-shared-nav',
  templateUrl: './shared-nav.component.html',
  styleUrls: ['./shared-nav.component.css']
})
export class SharedNavComponent implements OnInit {
  isLoggedIn = false;
  currentLanguage = 'fr'; // Langue par défaut : français
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private router: Router,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('SharedNavComponent: ngOnInit - isLoggedIn:', this.isLoggedIn);

    // Vérifier les permissions pour le débogage
    this.permissionService.hasPermission('gererUtilisateursEtRoles').subscribe(hasPermission => {
      console.log('SharedNavComponent: Permission gererUtilisateursEtRoles:', hasPermission);
    });

    this.permissionService.getUserPermissions().subscribe(permissions => {
      console.log('SharedNavComponent: Permissions de l\'utilisateur:', permissions);
    });
  }

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  getTranslation(key: string): string {
    // Implémentation simplifiée
    const translations: { [key: string]: { [key: string]: string } } = {
      fr: {
        'profile': 'Profil',
        'logout': 'Déconnexion'
      },
      en: {
        'profile': 'Profile',
        'logout': 'Logout'
      }
    };

    return translations[this.currentLanguage]?.[key] || key;
  }

  logout(): void {
    console.log('SharedNavComponent: Début de la déconnexion');

    try {
      // Appeler la méthode logout du service d'authentification
      this.authService.logout();
      console.log('SharedNavComponent: Service de déconnexion appelé avec succès');

      // Mettre à jour l'état local
      this.isLoggedIn = false;

      // Rediriger vers la page de connexion
      console.log('SharedNavComponent: Redirection vers la page de connexion');
      this.router.navigate(['/login']).then(success => {
        console.log('SharedNavComponent: Navigation vers /login:', success ? 'Réussie' : 'Échouée');
        if (!success) {
          // Si la navigation échoue, forcer le rechargement de la page
          console.log('SharedNavComponent: Navigation échouée, rechargement forcé');
          window.location.href = '/login';
        }
      }).catch(error => {
        console.error('SharedNavComponent: Erreur lors de la navigation:', error);
        // En cas d'erreur, forcer le rechargement de la page
        window.location.href = '/login';
      });

    } catch (error) {
      console.error('SharedNavComponent: Erreur lors de la déconnexion:', error);

      // En cas d'erreur, forcer la déconnexion et rediriger
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
}
