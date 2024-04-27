import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient) {}
  private API_URL = 'http://localhost/attendease/backend/api/';
  private readonly TOKEN = 'token';

  registerStudent(input: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}addstudent`, input);
  }

  loginStudent(input: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}loginstudent`, input);
  }

  getStudentData(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getstudentdata`);
  }

  getAllEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}events`);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN);
  }

  setToken(): void {
    const token = this.generateToken();
    sessionStorage.setItem(this.TOKEN, token);
  }

  deleteToken() {
    sessionStorage.removeItem(this.TOKEN);
  }

  getStudent(): Observable<any> {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', token);
    }
    return this.http.get<any>(`${this.API_URL}getstudentdata`, { headers });
  }

  private generateToken(): string {
    let token = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcsdefghijklmnopqrstuvwxyz0123456789';
    const tokenLen = 32;

    for (let i = 0; i < tokenLen; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return token;
  }
}
