import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../Models/Utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/user'; // URL temporaire

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  createUser(utilisateur: Utilisateur): Observable<any> {
    return this.http.post(this.apiUrl, utilisateur);
  }

  updateUser(id: string, utilisateur: Partial<Utilisateur>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  analyserActiviteUtilisateurs(jours: number = 30): Observable<any> {
    const params = new HttpParams().set('jours', jours.toString());
    return this.http.get(`${this.apiUrl}/activite`, { params });
  }

  exporterUtilisateursCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-csv`, { responseType: 'blob' });
  }
}