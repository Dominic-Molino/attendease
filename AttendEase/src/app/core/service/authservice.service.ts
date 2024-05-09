import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient, private helper: JwtHelperService) {}
  private API_URL = 'http://localhost/attendease/backend/api/';
  isLoggedIn: boolean = false;

  // auth
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

  getCurrentUserId(): number | null {
    const mytoken = sessionStorage.getItem('token');
    if (mytoken) {
      const decodedToken = this.helper.decodeToken(mytoken);
      if (decodedToken && decodedToken.user_id) {
        return decodedToken.user_id;
      }
    }
    return null;
  }

  updateStudent(data: any, id: any): Observable<any> {
    return this.http.post(`${this.API_URL}edituser/${id}`, data);
  }

  getStudentProfile(data: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}student`, data);
  }

  // events
  getAllEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}events`);
  }

  addEvent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}addevent`, data);
  }
}
