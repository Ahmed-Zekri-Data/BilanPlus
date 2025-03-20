import { Component, OnInit } from '@angular/core';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-tva',
  templateUrl: './list-tva.component.html',
  styleUrls: ['./list-tva.component.css']
})
export class ListTVAComponent implements OnInit {
  tvaList: TVA[] = [];
  displayedColumns: string[] = ['id', 'taux', 'montant', 'declarationID', 'actions'];

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTVAList();
  }

  loadTVAList(): void {
    this.declarationFiscaleTVAService.getAllTVA().subscribe({
      next: (tvaList) => {
        this.tvaList = tvaList;
      },
      error: (error) => {
        console.error('Error fetching TVA list:', error);
      }
    });
  }

  deleteTVA(id: string): void {
    if (confirm('Are you sure you want to delete this TVA entry?')) {
        this.declarationFiscaleTVAService.deleteTVA(id).subscribe({
            next: () => {
                this.tvaList = this.tvaList.filter(tva => tva._id !== id);
                console.log('TVA deleted successfully');
            },
            error: (error) => {
                console.error('Error deleting TVA:', error);
            }
        });
    }
}

viewDetails(id: string): void {
    this.router.navigate(['/getTVA', id]); // Works fine with string id
}
}