import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-declaration-fiscale',
  templateUrl: './declaration-fiscale.component.html',
  styleUrls: ['./declaration-fiscale.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(50px)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class DeclarationFiscaleComponent implements OnInit {
  declarationForm: FormGroup;
  comptesComptables: any[] = [];
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  showPreview: boolean = false;
  declarationId: string | null = null;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private compteComptableService: CompteComptableService,
    private snackBar: MatSnackBar
  ) {
    this.declarationForm = this.fb.group({
      periode: ['', Validators.required],
      montantTotal: [0, [Validators.required, Validators.min(0)]],
      statut: ['en préparation', Validators.required],
      compteComptable: ['', Validators.required],
      tva: this.fb.group({
        taux: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
        montant: [0, [Validators.required, Validators.min(0)]]
      })
    });
  }

  ngOnInit(): void {
    this.loadComptesComptables();
    
    // Vérifier s'il s'agit d'une édition
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.declarationId = id;
        this.loadDeclaration(id);
      }
    });
  }

  loadComptesComptables(): void {
    this.compteComptableService.getAllComptes().subscribe({
      next: (comptes) => {
        this.comptesComptables = comptes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des comptes comptables:', error);
        this.errors.push('Impossible de charger les comptes comptables');
      }
    });
  }

  loadDeclaration(id: string): void {
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration) => {
        // Charger la TVA associée à cette déclaration
        this.declarationFiscaleTVAService.getTVAByDeclaration(id).subscribe({
          next: (tva) => {
            this.declarationForm.patchValue({
              periode: declaration.periode,
              montantTotal: declaration.montantTotal,
              statut: declaration.statut,
              compteComptable: declaration.compteComptable._id || declaration.compteComptable,
              tva: {
                taux: tva && tva.length > 0 ? tva[0].taux : 20,
                montant: tva && tva.length > 0 ? tva[0].montant : 0
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors du chargement de la TVA:', error);
            this.errors.push('Impossible de charger les informations de TVA');
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la déclaration:', error);
        this.errors.push('Impossible de charger la déclaration fiscale');
        this.router.navigate(['/declarations']);
      }
    });
  }

  onSubmit(): void {
    if (this.declarationForm.invalid) return;
    
    this.isSubmitting = true;
    this.errors = [];
    
    const formData = this.declarationForm.value;
    
    // Préparer l'objet de déclaration fiscale
    const declaration = {
      periode: formData.periode,
      montantTotal: formData.montantTotal,
      statut: formData.statut,
      compteComptable: formData.compteComptable
    };
    
    // Préparer l'objet TVA
    const tva = {
      taux: formData.tva.taux,
      montant: formData.tva.montant,
      declaration: this.declarationId || '' // Sera remplacé par l'ID de la nouvelle déclaration si c'est une création
    };
    
    if (this.isEditMode && this.declarationId) {
      // Mise à jour d'une déclaration existante
      this.declarationFiscaleTVAService.updateDeclaration(this.declarationId, declaration).subscribe({
        next: (updatedDeclaration) => {
          // Mettre à jour la TVA associée
          this.declarationFiscaleTVAService.getTVAByDeclaration(this.declarationId!).subscribe({
            next: (existingTVA) => {
              if (existingTVA && existingTVA.length > 0) {
                // Mettre à jour la TVA existante
                this.declarationFiscaleTVAService.updateTVA(existingTVA[0]._id, {
                  ...tva,
                  declaration: this.declarationId
                }).subscribe({
                  next: () => this.handleSuccess('Déclaration et TVA mises à jour avec succès'),
                  error: (error) => this.handleError(error, 'Erreur lors de la mise à jour de la TVA')
                });
              } else {
                // Créer une nouvelle TVA
                this.declarationFiscaleTVAService.createTVA({
                  ...tva,
                  declaration: this.declarationId
                }).subscribe({
                  next: () => this.handleSuccess('Déclaration mise à jour et TVA créée avec succès'),
                  error: (error) => this.handleError(error, 'Erreur lors de la création de la TVA')
                });
              }
            },
            error: (error) => this.handleError(error, 'Erreur lors de la recherche de la TVA existante')
          });
        },
        error: (error) => this.handleError(error, 'Erreur lors de la mise à jour de la déclaration')
      });
    } else {
      // Création d'une nouvelle déclaration
      this.declarationFiscaleTVAService.createDeclaration(declaration).subscribe({
        next: (newDeclaration) => {
          // Créer la TVA associée
          this.declarationFiscaleTVAService.createTVA({
            ...tva,
            declaration: newDeclaration._id
          }).subscribe({
            next: () => this.handleSuccess('Déclaration et TVA créées avec succès'),
            error: (error) => this.handleError(error, 'Erreur lors de la création de la TVA')
          });
        },
        error: (error) => this.handleError(error, 'Erreur lors de la création de la déclaration')
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/declarations']);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  getCompteComptableNom(compteId: string): string {
    const compte = this.comptesComptables.find(c => c._id === compteId);
    return compte ? `${compte.numeroCompte} - ${compte.nom}` : 'Non trouvé';
  }

  private handleSuccess(message: string): void {
    this.isSubmitting = false;
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
    this.router.navigate(['/declarations']);
  }

  private handleError(error: any, defaultMessage: string): void {
    this.isSubmitting = false;
    console.error(defaultMessage, error);
    
    if (error.error && error.error.errors) {
      this.errors = error.error.errors;
    } else if (error.error && error.error.message) {
      this.errors.push(error.error.message);
    } else {
      this.errors.push(defaultMessage);
    }
    
    this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}