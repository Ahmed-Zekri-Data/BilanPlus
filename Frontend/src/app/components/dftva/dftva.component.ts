import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dftva',
  templateUrl: './dftva.component.html',
  styleUrls: ['./dftva.component.css']
})
export class DFTVAComponent implements OnInit {
  activeTabIndex: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Récupérer l'index de l'onglet à partir des paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['tab'] !== undefined) {
        const tabIndex = parseInt(params['tab'], 10);
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
          this.activeTabIndex = tabIndex;
        }
      }
    });
  }

  // Méthode pour changer d'onglet
  setActiveTab(tabIndex: number): void {
    this.activeTabIndex = tabIndex;
  }
}
