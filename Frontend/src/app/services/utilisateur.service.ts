import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getUtilisateurById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  createUtilisateur(utilisateur: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, utilisateur);
  }

  updateUtilisateur(id: string, utilisateur: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, utilisateur);
  }

  deleteUtilisateur(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }
}