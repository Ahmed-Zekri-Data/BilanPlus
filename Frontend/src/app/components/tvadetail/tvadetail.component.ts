import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tva-detail',
  templateUrl: './tvadetail.component.html',
  styleUrls: ['./tvadetail.component.css']
})
export class TvaDetailComponent implements OnInit {
  tva: TVA | null = null;
  declaration: DeclarationFiscale | null = null;
  errors: string[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTVADetails(id);
    } else {
      this.errors = ['ID de TVA non fourni'];
      this.isLoading = false;
    }
  }

  loadTVADetails(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getTVAById(id).subscribe({
      next: (tva) => {
        this.tva = tva;
        if (tva.declaration && typeof tva.declaration !== 'string') {
          this.declaration = tva.declaration;
        }
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/list-tva']);
  }
}