import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../Models/Role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private RoleApiUrl = 'http://localhost:3000/role'; // URL de l'API pour les rôles

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.RoleApiUrl}/getall`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.RoleApiUrl}/getbyid/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.RoleApiUrl}/add`, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.RoleApiUrl}/update/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.RoleApiUrl}/delete/${id}`);
  }
}