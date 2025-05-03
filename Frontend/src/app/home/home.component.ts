import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('buttonClick', [
      state('normal', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(0.95)' })),
      transition('normal => clicked', animate('200ms ease-in')),
      transition('clicked => normal', animate('200ms ease-out'))
    ])
  ]
})
export class HomeComponent implements OnInit {
  buttonState = 'normal';
  currentUser: any = null;
  userRole: string = '';
  sidebarOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (typeof user.role === 'string') {
          this.userRole = user.role;
        } else if (user.role && user.role.nom) {
          this.userRole = user.role.nom;
        } else {
          this.userRole = 'Utilisateur';
        }
      }
    });
  }

  onButtonClick() {
    this.buttonState = this.buttonState === 'normal' ? 'clicked' : 'normal';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}