import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../Models/Role';

interface RoleStats {
  roleId: string;
  roleName: string;
  nombreUtilisateurs: number;
  actifs: number;
  inactifs: number;
}

interface PermissionsUsage {
  [key: string]: any; // Adjust based on actual response structure
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/role';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }

  getUsersPerRole(): Observable<{ stats: RoleStats[] }> {
    return this.http.get<{ stats: RoleStats[] }>(`${this.apiUrl}/users-per-role`);
  }

  analysePermissionsUsage(): Observable<PermissionsUsage> {
    return this.http.get<PermissionsUsage>(`${this.apiUrl}/permissions-usage`);
  }
}