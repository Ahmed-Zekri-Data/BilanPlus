// Frontend/src/app/components/declaration-fiscale-form/declaration-fiscale-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FiscalService } from '../../services/fiscal.service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-declaration-fiscale',
  templateUrl: './declaration-fiscale.component.html',
  styleUrls: ['./declaration-fiscale.component.scss']
})
export class DeclarationFiscaleFormComponent implements OnInit {
  declarationForm: FormGroup;
  isLoading: boolean = false;
  isEditing: boolean = false;
  declarationId: string | null = null;
  previewData: any = null;
  delaisInfo: any = null;
  
  typesDeclaration = [
    { value: 'mensuelle', label: 'Mensuelle' },
    { value: 'trimestrielle', label: 'Trimestrielle' },
    { value: 'annuelle', label: 'Annuelle' }
  ];

  constructor(
    private fb: FormBuilder,
    private fiscalService: FiscalService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.declarationForm = this.fb.group({
      type: ['mensuelle', Validators.required],
      periodeDebut: [null, Validators.required],
      periodeFin: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.declarationId = this.route.snapshot.paramMap.get('id');
    
    if (this.declarationId) {
      this.isEditing = true;
      this.chargerDeclaration();
    } else {
      // Si création, initialiser avec le mois/trimestre en cours
      const aujourdhui = new Date();
      const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
      const finMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0);
      
      this.declarationForm.patchValue({
        periodeDebut: debutMois,
        periodeFin: finMois
      });
    }
  }

  chargerDeclaration(): void {
    // Normalement vous auriez un endpoint pour récupérer une déclaration existante
    // Pour cet exemple, nous simulons avec les données de prévisualisation
    this.isLoading = true;
    
    // Simuler un appel API
    setTimeout(() => {
      // Données fictives pour l'exemple
      const declaration = {
        type: 'mensuelle',
        periode: {
          debut: new Date(2024, 2, 1),
          fin: new Date(2024, 2, 31)
        },
        // Autres détails...
      };
      
      this.declarationForm.patchValue({
        type: declaration.type,
        periodeDebut: declaration.periode.debut,
        periodeFin: declaration.periode.fin
      });
      
      this.isLoading = false;
    }, 800);
  }

  onTypeChange(): void {
    // Ajuster automatiquement la période en fonction du type
    const type = this.declarationForm.get('type')?.value;
    const aujourdhui = new Date();
    let periodeDebut: Date;
    let periodeFin: Date;
    
    switch (type) {
      case 'mensuelle':
        periodeDebut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
        periodeFin = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0);
        break;
        
      case 'trimestrielle':
        const trimestre = Math.floor(aujourdhui.getMonth() / 3);
        periodeDebut = new Date(aujourdhui.getFullYear(), trimestre * 3, 1);
        periodeFin = new Date(aujourdhui.getFullYear(), (trimestre + 1) * 3, 0);
        break;
        
      case 'annuelle':
        periodeDebut = new Date(aujourdhui.getFullYear(), 0, 1);
        periodeFin = new Date(aujourdhui.getFullYear(), 11, 31);
        break;
        
      default:
        return;
    }
    
    this.declarationForm.patchValue({
      periodeDebut,
      periodeFin
    });
    
    // Effacer la prévisualisation lors du changement de type
    this.previewData = null;
  }

  genererPrevisualisation(): void {
    if (this.declarationForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement tous les champs requis', 'Fermer', {
        duration: 5000
      });
      return;
    }
    
    this.isLoading = true;
    const values = this.declarationForm.value;
    
    this.fiscalService.verifierDelaisDeclaration(
      values.type,
      values.periodeFin
    ).subscribe({
      next: (delaisResponse) => {
        this.delaisInfo = delaisResponse.data;
        
        // Générer la déclaration
        this.fiscalService.genererDeclarationFiscale(
          values.periodeDebut,
          values.periodeFin,
          values.type
        ).subscribe({
          next: (response) => {
            this.previewData = response.data;
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Erreur lors de la génération de la déclaration: ' + error.message, 'Fermer', {
              duration: 5000
            });
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la vérification des délais: ' + error.message, 'Fermer', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  soumettreDeclaration(): void {
    if (!this.previewData) {
      this.snackBar.open('Veuillez d\'abord générer une prévisualisation', 'Fermer', {
        duration: 5000
      });
      return;
    }
    
    this.isLoading = true;
    
    // Si c'est une édition, mettre à jour la déclaration
    if (this.isEditing && this.declarationId) {
      this.fiscalService.soumettreDeclaration(this.declarationId).subscribe({
        next: (response) => {
          this.snackBar.open('Déclaration soumise avec succès!', 'Fermer', {
            duration: 5000
          });
          this.router.navigate(['/fiscalite/declaration', this.declarationId]);
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la soumission: ' + error.message, 'Fermer', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
    } 
    // Sinon, créer une nouvelle déclaration
    else {
      // Pour l'exemple, nous supposons que previewData contient l'ID de la déclaration créée
      const declarationId = this.previewData.declaration._id;
      
      this.fiscalService.soumettreDeclaration(declarationId).subscribe({
        next: (response) => {
          this.snackBar.open('Déclaration créée et soumise avec succès!', 'Fermer', {
            duration: 5000
          });
          this.router.navigate(['/fiscalite/declaration', declarationId]);
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la soumission: ' + error.message, 'Fermer', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
    }
  }

  annuler(): void {
    this.router.navigate(['/fiscalite']);
  }
}
