import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-comptable',
  templateUrl: './gestion-comptable.component.html',
  styleUrls: ['./gestion-comptable.component.css'],
})
export class GestionComptableComponent implements OnInit {
  hasChildRoute = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if we're on a child route
    this.checkChildRoute();

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkChildRoute();
      });
  }

  private checkChildRoute() {
    const url = this.router.url;
    this.hasChildRoute = url !== '/gestion-comptable' && url.startsWith('/gestion-comptable/');
  }
}
