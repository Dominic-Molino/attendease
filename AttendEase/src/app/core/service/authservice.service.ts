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

  uploadImage(file: File, id: any): Observable<any> {
    return this.http.post(`${this.API_URL}adduserimage/${id}`, file);
  }

  updateStudent(data: any, id: any): Observable<any> {
    return this.http.post(`${this.API_URL}edituser/${id}`, data);
  }

  getStudentProfile(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}student/${id}`);
  }

  // events
  getAllEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}events`);
  }

  addEvent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}addevent`, data);
  }

  editEvent(data: any) {
    return this.http.post(`${this.API_URL}editevent`, data);
  }

  // uploadAvatar(userId: number, file: File) {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   return this.http.post(`${this.API_URL}uploadimage/${userId}`, formData);
  // }

  // getAvatar(userId: number) {
  //   return this.http.get(`${this.API_URL}getavatar/${userId}`, {
  //     responseType: 'blob',
  //   });
  // }
}
