import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chaima',
  templateUrl: './chaima.component.html',
  styleUrls: ['./chaima.component.css']
})
export class ChaimaComponent {
  constructor(private router: Router) {}

  navigateToAddClient(): void {
    this.router.navigate(['/clientform']);
  }

  navigateToClientList(): void {
    this.router.navigate(['/clientlist']);
  }

  navigateToCreateDevis(): void {
    this.router.navigate(['/clientdevis']);
  }

  navigateToDevisList(): void {
    this.router.navigate(['/clientdevislist']);
  }

  navigateToFactures(): void {
    this.router.navigate(['/facturelist']);
  }

  navigateToGenerateRelance(): void {
    this.router.navigate(['/relance']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboardinge']);
  }
}