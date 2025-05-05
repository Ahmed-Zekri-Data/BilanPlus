import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-tva',
  templateUrl: './list-tva.component.html',
  styleUrls: ['./list-tva.component.css']
})
export class ListTVAComponent implements OnInit {
  tvaList: TVA[] = [];
  displayedColumns: string[] = ['taux', 'montant', 'declaration', 'actions'];
  isLoading: boolean = true;
  errors: string[] = [];

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTVAList();
  }

  loadTVAList(): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getAllTVA().subscribe({
      next: (tvaList) => {
        this.tvaList = tvaList;
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/tvadetail', id]);
  }

  editTVA(id: string): void {
    this.router.navigate(['/updatetva', id]);
  }

  deleteTVA(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette TVA ?')) {
      this.declarationFiscaleTVAService.deleteTVA(id).subscribe({
        next: () => {
          this.snackBar.open('TVA supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadTVAList();
        },
        error: (errors: string[]) => {
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  addTVA(): void {
    this.router.navigate(['/addtva']);
  }
}