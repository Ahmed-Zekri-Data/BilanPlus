import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../Models/Utilisateur';


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private UserApiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<Utilisateur[]> {
      return this.http.get<Utilisateur[]>(`${this.UserApiUrl}/getall`);
    }
  
  getUserById(id: number): Observable<Utilisateur> {
      return this.http.get<Utilisateur>(`${this.UserApiUrl}/getbyid/${id}`);
    }
  
    createUser(declaration: Utilisateur): Observable<Utilisateur> {
      return this.http.post<Utilisateur>(`${this.UserApiUrl}/add`, declaration);
    }
    updateUser(id: number, declaration: Utilisateur): Observable<Utilisateur> {
      return this.http.put<Utilisateur>(`${this.UserApiUrl}/update/${id}`, declaration);
    }
    deleteUser(id: string): Observable<void> {
      return this.http.delete<void>(`${this.UserApiUrl}/delete/${id}`);
    }
    
  
}
