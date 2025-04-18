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
  
    getUserById(id: string): Observable<Utilisateur> { // Doit être string
      console.log('Récupération utilisateur ID:', id);
      return this.http.get<Utilisateur>(`${this.UserApiUrl}/getbyid/${id}`);
    }
  
    updateUser(id: string, declaration: Utilisateur): Observable<Utilisateur> { // Doit être string
      console.log('Mise à jour utilisateur ID:', id);
      return this.http.put<Utilisateur>(`${this.UserApiUrl}/update/${id}`, declaration);
    }
  
    createUser(declaration: Utilisateur): Observable<Utilisateur> {
      console.log('Création utilisateur:', declaration);
      return this.http.post<Utilisateur>(`${this.UserApiUrl}/add`, declaration);
    }
     deleteUser(id: string): Observable<void> {
      return this.http.delete<void>(`${this.UserApiUrl}/delete/${id}`);
    }
    
  
}
