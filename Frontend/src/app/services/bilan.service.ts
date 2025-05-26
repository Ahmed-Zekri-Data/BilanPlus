import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BilanService {
  private apiUrl = 'http://localhost:4000/bilan';

  constructor(private http: HttpClient) {}

  getBilan(date?: string): Observable<any> {
    let params: any = {};
    if (date) params.date = date;

    return this.http.get<any>(this.apiUrl, { params });
  }
}
