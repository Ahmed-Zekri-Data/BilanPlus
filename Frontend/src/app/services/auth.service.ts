// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, PasswordResetRequest, PasswordReset } from '../Models/Auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL de base : http://localhost:3000
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser?.token || null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials).pipe( // Correction : /auth/login -> /user/login
      map(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response.user);
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  requestPasswordReset(email: string): Observable<any> {
    const payload: PasswordResetRequest = { email };
    return this.http.post(`${this.apiUrl}/user/request-password-reset`, payload);
  }

  resetPassword(data: PasswordReset): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/reset-password`, data);
  }
}