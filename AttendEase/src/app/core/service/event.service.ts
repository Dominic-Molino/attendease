import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private http: HttpClient, private helper: JwtHelperService) {}

  private API_URL = 'http://localhost/attendease/backend/api/';

  addEvent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}addevent`, data);
  }

  getAllEvents(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}events`);
  }

  deleteEvent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}deleteevent`, data);
  }
}
