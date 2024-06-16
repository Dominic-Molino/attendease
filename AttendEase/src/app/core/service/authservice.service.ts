import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, interval, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient, private helper: JwtHelperService) {}
  // private API_URL = 'https://gc-attendease.online/backend/api/';
  private API_URL = 'http://localhost/attendease/backend/api/';

  isLoggedIn: boolean = false;

  //get a user or all users
  getUsers(id: any = null): Observable<any> {
    if (id) {
      return this.http.get<any>(`${this.API_URL}users/${id}`);
    } else {
      return this.http.get<any>(`${this.API_URL}users`);
    }
  }

  getRoles(id: any = null): Observable<any> {
    if (id) {
      return this.http.get<any>(`${this.API_URL}roles/${id}`);
    } else {
      return this.http.get<any>(`${this.API_URL}roles`);
    }
  }

  editUserRole(id: number, inputdata: any) {
    return this.http.post<any>(`${this.API_URL}edituserrole/${id}`, inputdata);
  }

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

  getCurrentUserRole(): number | null {
    const mytoken = sessionStorage.getItem('token');
    if (mytoken) {
      const decodedToken = this.helper.decodeToken(mytoken);
      if (decodedToken && decodedToken.role_id) {
        return decodedToken.role_id;
      }
    }
    return null;
  }

  uploadImage(id: any, file: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}uploadimage/${id}`, file);
  }

  updateStudent(data: any, id: any): Observable<any> {
    return this.http.post(`${this.API_URL}edituser/${id}`, data);
  }

  getStudentProfile(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}users/${id}`);
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

  uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.API_URL}uploadimage/${userId}`, formData);
  }

  getAvatar(userId: number) {
    return this.http.get(`${this.API_URL}getavatar/${userId}`, {
      responseType: 'blob',
    });
  }

  getUsersByEventAttendance(eventId: number) {
    return this.http.get(`${this.API_URL}getusersbyeventattendance/${eventId}`);
  }

  getAttendanceByUser(userId: number, eventId: number) {
    return this.http.get(
      `${this.API_URL}getattendancebyuser/${userId}/${eventId}`
    );
  }

  getAttendanceImage(attendanceId: number) {
    return this.http.get(`${this.API_URL}getattendanceimage/${attendanceId}`, {
      responseType: 'blob',
    });
  }

  toggleAttendanceRemark(data: any) {
    return this.http.post(`${this.API_URL}toggleattendanceremark`, data);
  }

  uploadAttendanceImage(eventId: number, userId: number, file: File) {
    //IMPORTANT! key name must be named 'file'
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.API_URL}uploadattendanceimage/${eventId}/${userId}`,
      formData
    );
  }

  // attendance
  markAttendance(eventId: number, userId: number): Observable<any> {
    const data = { event_id: eventId, user_id: userId };
    return this.http.post<any>(`${this.API_URL}markattendance`, data);
  }

  postFeedback(
    eventId: number,
    userId: number,
    feedbackData: any
  ): Observable<any> {
    return this.http.post(
      `${this.API_URL}addfeedback/${eventId}/${userId}`,
      feedbackData
    );
  }

  getEventFeedback(event_id: any = null): Observable<any> {
    if (event_id) {
      return this.http.get(`${this.API_URL}getEventfeedback/${event_id}`);
    } else {
      return this.http.get(`${this.API_URL}getEventfeedback`);
    }
  }

  getUserFeedback(user_id: any = null): Observable<any> {
    if (user_id) {
      return this.http.get(`${this.API_URL}getUserFeedback/${user_id}`);
    } else {
      return this.http.get(`${this.API_URL}getUserFeedback`);
    }
  }

  getRegisteredEvents(userId: number) {
    return this.http.get<any[]>(
      `${this.API_URL}user_registered_events_notification/${userId}`
    );
  }

  fetchRegisteredEventsPeriodically(userId: number): Observable<any[]> {
    return interval(3600000).pipe(
      switchMap(() => this.getRegisteredEvents(userId))
    );
  }

  getAllRemarks(eventId: number): Observable<any> {
    return this.http.get(`${this.API_URL}getAllRemarks/${eventId}`);
  }
}
