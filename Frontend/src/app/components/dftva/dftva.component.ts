import { Component } from '@angular/core';

@Component({
  selector: 'app-dftva',
  templateUrl: './dftva.component.html',
  styleUrls: ['./dftva.component.css']
})
export class DFTVAComponent {
  activeTabIndex: number = 0;

  // Méthode pour changer d'onglet
  setActiveTab(tabIndex: number): void {
    this.activeTabIndex = tabIndex;
  }
}
