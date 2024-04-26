import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient) {}
  private API_URL = 'http://localhost/attendease/backend/api/';

  registerStudent(input: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}addstudent`, input);
  }

  loginStudent(input: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}loginstudent`, input);
  }
}
