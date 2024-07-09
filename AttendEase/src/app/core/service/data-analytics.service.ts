import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataAnalyticsService {
  constructor(private http: HttpClient) {}

  // private API_URL = 'https://gc-attendease.online/backend/api/';
  private API_URL = 'http://localhost/attendease/backend/api/';

  getCourse(): Observable<any> {
    return this.http.get(`${this.API_URL}getcoursecount`);
  }

  getAllRegisteredUser(): Observable<any> {
    return this.http.get(`${this.API_URL}getAllRegisteredUser`);
  }

  getPastAttendance(): Observable<any> {
    return this.http.get(`${this.API_URL}getpasteventsattendance`);
  }

  getBlock(): Observable<any> {
    return this.http.get(`${this.API_URL}getblockcount`);
  }

  getYearLevel(): Observable<any> {
    return this.http.get(`${this.API_URL}getyearlevelcount`);
  }

  getAllEventAttendees(): Observable<any> {
    return this.http.get(`${this.API_URL}totalAttendees`);
  }

  getAnalytics(event_id = null): Observable<any> {
    return this.http.get(`${this.API_URL}analytics/${event_id}`);
  }

  getDoneEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getalldonevents`);
  }

  getOngoingEvents(event_id = null): Observable<any> {
    if (event_id) {
      return this.http.get<any>(
        `${this.API_URL}getallongoingvents/${event_id}`
      );
    } else {
      return this.http.get<any>(`${this.API_URL}getallongoingvents`);
    }
  }

  getActivityLogs(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getlogs/${org_id}`);
  }
}
