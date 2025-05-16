import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tcl-management',
  templateUrl: './tcl-management.component.html',
  styleUrls: ['./tcl-management.component.css']
})
export class TclManagementComponent implements OnInit {
  tclForm: FormGroup;
  isLoading: boolean = false;
  tclResults: any = null;
  error: string | null = null;

  constructor(private fb: FormBuilder) {
    this.tclForm = this.fb.group({
      dateDebut: [new Date()],
      dateFin: [new Date()],
      tauxTCL: [0.2]
    });
  }

  ngOnInit(): void {
  }

  calculateTCL(): void {
    const { dateDebut, dateFin, tauxTCL } = this.tclForm.value;
    
    // Validation des dates et du taux
    if (!dateDebut || !dateFin) {
      this.error = 'Veuillez sélectionner des dates valides';
      return;
    }
    
    if (new Date(dateDebut) > new Date(dateFin)) {
      this.error = 'La date de début doit être antérieure à la date de fin';
      return;
    }
    
    if (tauxTCL === null || tauxTCL === undefined || tauxTCL < 0) {
      this.error = 'Veuillez entrer un taux TCL valide';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    // Simuler un appel API (à remplacer par un appel réel)
    setTimeout(() => {
      this.tclResults = {
        periode: {
          debut: dateDebut,
          fin: dateFin
        },
        chiffreAffairesHT: 125000.50,
        tauxTCL: tauxTCL,
        montantTCL: 125000.50 * tauxTCL / 100
      };
      this.isLoading = false;
    }, 1000);
  }

  resetForm(): void {
    this.tclForm.reset({
      dateDebut: new Date(),
      dateFin: new Date(),
      tauxTCL: 0.2
    });
    this.tclResults = null;
    this.error = null;
  }
}
