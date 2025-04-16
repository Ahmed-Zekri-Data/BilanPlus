import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, PasswordResetRequest, PasswordReset } from '../Models/Auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/user'; // URL temporaire
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.utilisateur));
          this.currentUserSubject.next(response.utilisateur);
        }),
        catchError(error => {
          const errorResponse: LoginResponse = { 
            message: error.error?.message || 'Erreur de connexion', 
            token: '', 
            utilisateur: null 
          };
          return of(errorResponse);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user && user.role === 'admin';
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user && user.permissions && user.permissions[permission];
  }

  requestPasswordReset(email: PasswordResetRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-reset-password`, email);
  }

  resetPassword(resetData: PasswordReset): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData);
  }
}