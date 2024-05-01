import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  getStudentData(token: string): Observable<any> {
    const header = new HttpHeaders({
      Content: 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.API_URL}getstudent`, { headers: header });
  }

  getAllEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}events`);
  }
}