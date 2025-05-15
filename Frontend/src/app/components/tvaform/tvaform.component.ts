import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { TVA } from '../../Models/TVA';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tva-form',
  templateUrl: './tvaform.component.html',
  styleUrls: ['./tvaform.component.css']
})
export class TvaFormComponent implements OnInit {
  tva: TVA = {
    taux: 19, // Valeur par défaut
    montant: 19, // Valeur par défaut égale au taux
    declarations: []
  };
  declarations: DeclarationFiscale[] = [];
  isEditMode: boolean = false;
  errors: string[] = [];
  fieldErrors: { taux: string; montant: string; declarations: string } = {
    taux: '',
    montant: '',
    declarations: ''
  };
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadTVADetails(id);
    }
    this.loadDeclarations();
  }

  loadTVADetails(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getTVAById(id).subscribe({
      next: (tva) => {
        this.tva = { ...tva };
        if (this.tva.declarations && Array.isArray(this.tva.declarations)) {
          this.tva.declarations = this.tva.declarations.map(decl =>
            typeof decl === 'string' ? decl : decl._id!
          );
          // Calculer le montant en fonction des déclarations sélectionnées
          setTimeout(() => this.onDeclarationsChange(), 0);
        } else {
          this.tva.declarations = [];
        }
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.mapFieldErrors(errors);
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations: DeclarationFiscale[]) => {
        this.declarations = declarations;
        // Si nous avons des déclarations sélectionnées, calculer le montant
        if (this.tva.declarations && this.tva.declarations.length > 0) {
          setTimeout(() => this.onDeclarationsChange(), 0);
        }
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.mapFieldErrors(errors);
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
      }
    });
  }

  saveTVA(): void {
    this.clearErrors();

    // Vérifier que le taux est valide (7, 13 ou 19)
    const validTaux = [7, 13, 19];
    if (!this.tva.taux || !validTaux.includes(this.tva.taux)) {
      this.errors = ['Le taux de TVA doit être 7%, 13% ou 19%'];
      this.mapFieldErrors(this.errors);
      this.snackBar.open('Le taux de TVA doit être 7%, 13% ou 19%', 'Fermer', { duration: 3000 });
      return;
    }

    // Vérifier que le montant est valide
    if (this.tva.montant === undefined || this.tva.montant === null || isNaN(this.tva.montant) || this.tva.montant < 0) {
      this.errors = ['Le montant de TVA doit être un nombre positif'];
      this.mapFieldErrors(this.errors);
      this.snackBar.open('Le montant de TVA doit être un nombre positif', 'Fermer', { duration: 3000 });
      return;
    }

    // La déclaration est maintenant optionnelle

    if (this.isEditMode) {
      this.declarationFiscaleTVAService.updateTVA(String(this.tva._id), this.tva).subscribe({
        next: () => {
          this.snackBar.open('TVA mise à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/DFTVA'], { queryParams: { tab: 2 } });
        },
        error: (errors: string[]) => {
          this.errors = errors;
          this.mapFieldErrors(errors);
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.declarationFiscaleTVAService.createTVA(this.tva).subscribe({
        next: () => {
          this.snackBar.open('TVA créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/DFTVA'], { queryParams: { tab: 2 } });
        },
        error: (errors: string[]) => {
          this.errors = errors;
          this.mapFieldErrors(errors);
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.clearErrors();
    this.router.navigate(['/DFTVA'], { queryParams: { tab: 2 } });
  }

  private clearErrors(): void {
    this.errors = [];
    this.fieldErrors = { taux: '', montant: '', declarations: '' };
  }

  private mapFieldErrors(errors: string[]): void {
    errors.forEach(error => {
      if (error.toLowerCase().includes('taux')) {
        this.fieldErrors.taux = error;
      } else if (error.toLowerCase().includes('montant')) {
        this.fieldErrors.montant = error;
      } else if (error.toLowerCase().includes('declaration')) {
        this.fieldErrors.declarations = error;
      }
    });
  }

  // Mettre à jour le montant lorsque le taux change (si le montant est égal à l'ancien taux)
  onTauxChange(newTaux: number): void {
    // Si le montant est égal à l'ancien taux ou à 0, mettre à jour le montant
    if (this.tva.montant === 0 || this.tva.montant === this.tva.taux) {
      this.tva.montant = newTaux;
    }
  }

  // Calculer le montant total de TVA en fonction des déclarations sélectionnées
  onDeclarationsChange(): void {
    if (!this.tva.declarations || this.tva.declarations.length === 0) {
      this.tva.montant = 0;
      return;
    }

    // Extraire les IDs des déclarations sélectionnées
    const selectedIds = this.tva.declarations.map(decl =>
      typeof decl === 'string' ? decl : decl._id
    );

    // Trouver les déclarations correspondantes
    const selectedDeclarations = this.declarations.filter(decl =>
      selectedIds.includes(decl._id!)
    );

    // Calculer la somme des TVA dues
    let totalAmount = 0;
    selectedDeclarations.forEach(decl => {
      // Utiliser totalTVADue si disponible, sinon utiliser 0
      totalAmount += decl.totalTVADue || 0;
    });

    // Arrondir à 2 décimales pour éviter les problèmes de précision
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Mettre à jour le montant
    this.tva.montant = totalAmount;
  }

  /**
   * Récupère le libellé d'une déclaration à partir de son ID ou de l'objet déclaration
   * @param declIdOrObj ID de la déclaration ou objet déclaration
   * @returns Libellé formaté de la déclaration
   */
  getDeclarationLabel(declIdOrObj: string | DeclarationFiscale): string {
    // Si c'est déjà un objet DeclarationFiscale
    if (typeof declIdOrObj !== 'string') {
      const declaration = declIdOrObj;
      const montant = declaration.montantTotal !== undefined ? declaration.montantTotal : 0;
      return `${this.formatPeriode(declaration.periode)} (${montant.toFixed(2)} DT)`;
    }

    // Si c'est un ID (string)
    const declId = declIdOrObj;
    const declaration = this.declarations.find(d => d._id === declId);
    if (declaration) {
      const montant = declaration.montantTotal !== undefined ? declaration.montantTotal : 0;
      return `${this.formatPeriode(declaration.periode)} (${montant.toFixed(2)} DT)`;
    }
    return `Déclaration #${declId.substring(0, 8)}...`;
  }

  /**
   * Supprime une déclaration de la liste des déclarations sélectionnées
   * @param declIdOrObj ID de la déclaration ou objet déclaration à supprimer
   */
  removeDeclaration(declIdOrObj: string | DeclarationFiscale): void {
    if (this.tva.declarations) {
      // Déterminer l'ID à supprimer
      const idToRemove = typeof declIdOrObj === 'string'
        ? declIdOrObj
        : declIdOrObj._id;

      // Filtrer les déclarations
      this.tva.declarations = this.tva.declarations.filter(item => {
        const itemId = typeof item === 'string' ? item : item._id;
        return itemId !== idToRemove;
      });

      this.onDeclarationsChange(); // Recalculer le montant
    }
  }

  /**
   * Formate une période de déclaration (ex: "2025-05-01 - 2025-05-31") en format lisible (ex: "Mai 2025")
   * @param periode La période à formater
   * @returns La période formatée
   */
  formatPeriode(periode: string | undefined): string {
    if (!periode) return 'Période non spécifiée';

    try {
      // Extraire les dates de début et de fin
      const dates = periode.split(' - ');
      if (dates.length !== 2) return periode;

      const dateDebut = new Date(dates[0]);
      const dateFin = new Date(dates[1]);

      // Vérifier si les dates sont valides
      if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
        return periode;
      }

      // Vérifier si les dates sont dans le même mois et la même année
      if (dateDebut.getMonth() === dateFin.getMonth() && dateDebut.getFullYear() === dateFin.getFullYear()) {
        // Formater en "Mois Année"
        const mois = dateDebut.toLocaleString('fr-FR', { month: 'long' });
        const annee = dateDebut.getFullYear();
        return `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`;
      }

      // Si les dates couvrent plusieurs mois, formater en "Mois Année - Mois Année"
      const moisDebut = dateDebut.toLocaleString('fr-FR', { month: 'long' });
      const anneeDebut = dateDebut.getFullYear();
      const moisFin = dateFin.toLocaleString('fr-FR', { month: 'long' });
      const anneeFin = dateFin.getFullYear();

      return `${moisDebut.charAt(0).toUpperCase() + moisDebut.slice(1)} ${anneeDebut} - ${moisFin.charAt(0).toUpperCase() + moisFin.slice(1)} ${anneeFin}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la période:', error);
      return periode;
    }
  }
}