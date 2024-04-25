import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient) {}
  private readonly TOKEN_KEY = 'token';
  API_URL = 'http://localhost:3000/user';

  getAll(): Observable<any> {
    return this.http.get(this.API_URL);
  }

  getbyCode(code: any): Observable<any> {
    return this.http.get(this.API_URL + '/' + code);
  }

  registerStudent(inputData: any): Observable<any> {
    return this.http.post(this.API_URL, inputData);
  }

  updateStudent(code: any, inputData: any): Observable<any> {
    return this.http.put(this.API_URL + '/' + code, inputData);
  }

  isLoggedIn() {
    return sessionStorage.getItem('email') != null;
  }

  getStudentData(token: string) {
    return this.http.get<any>(this.API_URL + '/' + token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }
}
