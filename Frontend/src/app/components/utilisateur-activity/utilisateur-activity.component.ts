import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuditService, AuditLog, LoginHistory } from '../../services/audit.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Models/Utilisateur';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-utilisateur-activity',
  templateUrl: './utilisateur-activity.component.html',
  styleUrls: ['./utilisateur-activity.component.css']
})
export class UtilisateurActivityComponent implements OnInit {
  userId: string = '';
  utilisateur: Utilisateur | null = null;
  loginHistory: LoginHistory[] = [];
  userActions: AuditLog[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Colonnes pour les tableaux
  loginColumns: string[] = ['date', 'ip', 'navigateur', 'reussite', 'details'];
  actionColumns: string[] = ['date', 'action', 'details', 'ip'];

  constructor(
    private route: ActivatedRoute,
    private auditService: AuditService,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUtilisateur();
      this.loadLoginHistory();
    }
  }

  loadUtilisateur(): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(this.userId).subscribe({
      next: (response) => {
        this.utilisateur = response.utilisateur;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des informations de l\'utilisateur.';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  loadLoginHistory(): void {
    this.loading = true;
    this.auditService.getLoginHistory(this.userId).subscribe({
      next: (data) => {
        this.loginHistory = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'historique de connexion.';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  loadUserActions(): void {
    this.loading = true;
    this.auditService.getUserActions(this.userId).subscribe({
      next: (data) => {
        this.userActions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des actions de l\'utilisateur.';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    // Si l'onglet des actions est sélectionné et que les actions n'ont pas encore été chargées
    if (event.index === 1 && this.userActions.length === 0) {
      this.loadUserActions();
    }
  }

  getStatusClass(reussite: boolean): string {
    return reussite ? 'success-status' : 'error-status';
  }

  getStatusText(reussite: boolean): string {
    return reussite ? 'Réussie' : 'Échouée';
  }

  exportLoginHistoryToCSV(): void {
    if (this.loginHistory.length === 0) return;

    const csvData = this.loginHistory.map(login => ({
      Date: login.date ? new Date(login.date).toLocaleString() : 'Non disponible',
      IP: login.ip || 'Non disponible',
      Navigateur: login.navigateur || 'Non disponible',
      Statut: this.getStatusText(login.reussite),
      Details: login.details || ''
    }));

    const csv = [
      'Date,IP,Navigateur,Statut,Details',
      ...csvData.map(row => `"${row.Date}","${row.IP}","${row.Navigateur}","${row.Statut}","${row.Details}"`)
    ].join('\n');

    this.downloadCSV(csv, `connexions_${this.utilisateur?.nom || 'utilisateur'}.csv`);
  }

  exportUserActionsToCSV(): void {
    if (this.userActions.length === 0) return;

    const csvData = this.userActions.map(action => ({
      Date: action.date ? new Date(action.date).toLocaleString() : 'Non disponible',
      Action: action.action || 'Non disponible',
      Details: action.details || 'Non disponible',
      IP: action.ip || 'Non disponible'
    }));

    const csv = [
      'Date,Action,Details,IP',
      ...csvData.map(row => `"${row.Date}","${row.Action}","${row.Details}","${row.IP}"`)
    ].join('\n');

    this.downloadCSV(csv, `actions_${this.utilisateur?.nom || 'utilisateur'}.csv`);
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
