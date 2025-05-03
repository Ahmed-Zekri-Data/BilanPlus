import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur.service';

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
    private router: Router,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUtilisateur(id);
    }
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
    this.router.navigate(['/utilisateurs']);
  }
}