import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../Models/Role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/role'; // URL temporaire

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
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