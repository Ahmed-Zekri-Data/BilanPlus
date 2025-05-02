import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { CompteComptableService } from '../../compte-comptable.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { CompteComptable } from '../../Models/CompteComptable';

@Component({
  selector: 'app-df-detail',
  templateUrl: './df-detail.component.html',
  styleUrls: ['./df-detail.component.css']
})
export class DFDetailComponent implements OnInit {
  declaration: DeclarationFiscale | null = null;
  compteComptable: CompteComptable | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private compteComptableService: CompteComptableService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('Loading declaration with ID:', id);
      this.loadDeclarationDetails(id);
    } else {
      this.errorMessage = 'Aucun ID de déclaration fourni';
      this.isLoading = false;
    }
  }

  loadDeclarationDetails(id: string): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarationById(id).subscribe({
      next: (declaration) => {
        console.log('Declaration loaded:', declaration);
        this.declaration = declaration;
        this.loadCompteComptable(declaration.compteComptable);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.errorMessage = 'Échec du chargement des détails de la déclaration : ' + error.message;
        this.isLoading = false;
      }
    });
  }

  loadCompteComptable(compteId: string | CompteComptable): void {
    if (typeof compteId !== 'string') {
      this.compteComptable = compteId; // Si c'est déjà un objet
      console.log('CompteComptable déjà chargé:', this.compteComptable);
    } else {
      console.log('Chargement du compte comptable avec ID:', compteId);
      this.compteComptableService.getComptes().subscribe({
        next: (comptes) => {
          this.compteComptable = comptes.find(compte => compte._id === compteId) || null;
          console.log('CompteComptable trouvé:', this.compteComptable);
        },
        error: (error) => {
          console.error('Erreur compte comptable:', error);
          this.errorMessage = 'Échec du chargement des détails du compte comptable : ' + error.message;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/list-declarations']);
  }

  editDeclaration(): void {
    if (this.declaration?._id) {
      this.router.navigate(['/updateDF', this.declaration._id]);
    }
  }

  // Méthode pour formater la période
  formatPeriode(periode: string): string {
    try {
      if (periode.includes(' - ')) {
        const [startDate, endDate] = periode.split(' - ').map(date => new Date(date));
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return periode;
        }
        const startFormatted = this.formatDate(startDate);
        const endFormatted = this.formatDate(endDate);
        return `du ${startFormatted} au ${endFormatted}`;
      }

      if (/^\d{4}-\d{2}$/.test(periode)) {
        const [year, month] = periode.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const startFormatted = this.formatDate(startDate);
        const endFormatted = this.formatDate(endDate);
        return `du ${startFormatted} au ${endFormatted}`;
      }

      const date = new Date(periode);
      if (!isNaN(date.getTime())) {
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startFormatted = this.formatDate(startDate);
        const endFormatted = this.formatDate(endDate);
        return `du ${startFormatted} au ${endFormatted}`;
      }

      return periode;
    } catch (error) {
      console.error('Erreur lors du formatage de la période :', periode, error);
      return periode;
    }
  }

  // Méthode utilitaire pour formater une date en DD/MM/YYYY
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Méthode pour obtenir le nom du compte comptable
  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  getCompteComptableName(compteComptable: CompteComptable | string): string {
    if (this.isObject(compteComptable)) {
      return (compteComptable as CompteComptable).nom;
    }
    return compteComptable as string;
  }
}