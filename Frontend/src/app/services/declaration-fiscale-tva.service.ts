import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeclarationFiscale } from '../Models/DeclarationFiscale';
import { TVA } from '../Models/TVA';
@Injectable({
  providedIn: 'root'
})
export class DeclarationFiscaleTVAService {
  private DFApiUrl = 'http://localhost:3000/DF'; 
  private tvaApiUrl = 'http://localhost:3000/TVA'; 
  constructor(private http: HttpClient) { }

  // --- DeclarationFiscale Methods ---

  // Get all declarations
  getDeclarations(): Observable<DeclarationFiscale[]> {
    return this.http.get<DeclarationFiscale[]>(`${this.DFApiUrl}/getalldf`);
  }

  // Get a single declaration by ID
  getDeclarationById(id: string): Observable<DeclarationFiscale> {
    return this.http.get<DeclarationFiscale>(`${this.DFApiUrl}/getDFbyid/${id}`);
  }

  // Create a new declaration
  createDeclaration(declaration: DeclarationFiscale): Observable<DeclarationFiscale> {
    return this.http.post<DeclarationFiscale>(`${this.DFApiUrl}/addDeclaration`, declaration);
  }
// Update a declaration
  updateDeclaration(id: number, declaration: DeclarationFiscale): Observable<DeclarationFiscale> {
    return this.http.put<DeclarationFiscale>(`${this.DFApiUrl}/updateDF/${id}`, declaration);
  }
// Delete a declaration
deleteDeclaration(id: number): Observable<void> {
  return this.http.delete<void>(`${this.DFApiUrl}/deleteDF/${id}`);
}
// --- TVA Methods ---

// Get all TVA entries
getAllTVA(): Observable<TVA[]> {
  return this.http.get<TVA[]>(`${this.tvaApiUrl}/getallTVA`);
}
// Get a single TVA by ID
getTVAById(id: string): Observable<TVA> {
  return this.http.get<TVA>(`${this.tvaApiUrl}/getTVAbyid/${id}`);
}
// Create a new TVA 
createTVA(tva: TVA): Observable<TVA> {
  return this.http.post<TVA>(`${this.tvaApiUrl}/addTVA`, tva);
}
// Update a TVA
updateTVA(id: string, tva: TVA): Observable<TVA> {
  return this.http.put<TVA>(`${this.tvaApiUrl}/updateTVA/${id}`, tva);
}
// Delete a TVA
deleteTVA(id: string): Observable<void> {
  return this.http.delete<void>(`${this.tvaApiUrl}/deleteTVA/${id}`);
}
}
