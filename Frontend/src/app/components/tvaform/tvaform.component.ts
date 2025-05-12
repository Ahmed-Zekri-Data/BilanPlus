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

    // Trouver les déclarations correspondantes
    const selectedDeclarations = this.declarations.filter(decl =>
      this.tva.declarations?.includes(decl._id!)
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
}