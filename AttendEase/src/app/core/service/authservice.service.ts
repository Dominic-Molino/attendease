import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient, private helper: JwtHelperService) {}
  private API_URL = 'http://localhost/attendease/backend/api/';
  isLoggedIn: boolean = false;

  registerStudent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}adduser`, data);
  }

  loginStudent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}login`, data);
  }

  isUserLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    return !this.helper.isTokenExpired(token);
  }

  getAllEvents(): Observable<any> {
    return this.http.get(`${this.API_URL}events`);
  }
}
