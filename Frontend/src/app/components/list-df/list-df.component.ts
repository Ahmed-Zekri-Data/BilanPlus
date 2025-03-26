import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';

@Component({
  selector: 'app-list-df',
  templateUrl: './list-df.component.html',
  styleUrls: ['./list-df.component.css']
})
export class ListDFComponent implements OnInit {
  declarations: DeclarationFiscale[] = [];
  errorMessage: string | null = null;

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDeclarations();
  }

  loadDeclarations(): void {
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations) => {
        this.declarations = declarations;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load declarations: ' + error.message;
      }
    });
  }

  editDeclaration(id: string): void {
    this.router.navigate(['/UpdateDF', id]); 
  }

  deleteDeclaration(id: string): void {

    if (confirm('Are you sure you want to delete this declaration?')) {
      this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
        next: () => {
          this.declarations = this.declarations.filter(d => d._id !== id.toString());
          console.log('Declaration deleted successfully');
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete declaration: ' + error.message;
        }
      });
    }
  }

  addNewDeclaration(): void {
    this.router.navigate(['/addDF']); // Adjust route as needed
  }
}