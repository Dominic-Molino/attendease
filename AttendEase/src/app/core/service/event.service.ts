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

  addEvent(data: any) {
    return this.http.post(`${this.API_URL}addevent`, data);
  }
}
