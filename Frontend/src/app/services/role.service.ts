import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Role } from '../Models/Role';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/role'; // URL temporaire

  constructor( private http: HttpClient, 
    private router: Router,
    private authService: AuthService
  ) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    if (error.status === 401 || error.status === 403) {
      // Si erreur d'authentification, rediriger vers la page de connexion
      this.authService.logout();
      this.router.navigate(['/login']);
      return throwError(() => 'Session expirée ou non autorisé. Veuillez vous reconnecter.');
    }
    
    return throwError(() => error.error?.message || 'Une erreur est survenue');
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl).pipe(
      map(roles => {
        // Normaliser les IDs
        return roles.map(role => {
          role.id = role.id || role.id;
          return role;
        });
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Role): Observable<{ message: string, role: Role }> {
    return this.http.post<{ message: string, role: Role }>(this.apiUrl, role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<{ message: string, role: Role }> {
    return this.http.put<{ message: string, role: Role }>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getUsersPerRole(): Observable<{ stats: { roleId: string, roleName: string, nombreUtilisateurs: number, actifs: number, inactifs: number }[] }> {
    return this.http.get<{ stats: { roleId: string, roleName: string, nombreUtilisateurs: number, actifs: number, inactifs: number }[] }>(`${this.apiUrl}/stats`);
  }

  analysePermissionsUsage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions`);
  }
}