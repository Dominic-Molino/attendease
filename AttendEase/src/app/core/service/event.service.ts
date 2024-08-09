import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, map, throwError } from 'rxjs';
import { Event } from '../../interfaces/EventInterface';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private http: HttpClient, private helper: JwtHelperService) {}

  // private API_URL = 'https://gc-attendease.online/backend/api/';
  private API_URL = 'http://localhost/attendease/backend/api/';

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

  addEvent(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}addevent`, data);
  }

  addRequest(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}postrequest`, data);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<any>(`${this.API_URL}events`).pipe(
      map((result: any) => {
        return result.payload;
      })
    );
  }

  getEvents(event_id: any = null): Observable<any> {
    if (event_id) {
      return this.http.get(`${this.API_URL}allevents/${event_id}`);
    } else {
      return this.http.get(`${this.API_URL}allevents`);
    }
  }

  getEventById(eventId: any): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}events/${eventId}`).pipe(
      map((result: any) => {
        return result.payload;
      })
    );
  }

  deleteEvent(data: any): Observable<any> {
    return this.http.delete(`${this.API_URL}deleteevent/${data}`);
  }

  editEvent(id: any, data: any) {
    return this.http.post(`${this.API_URL}editevent/${id}`, data);
  }

  addDeadline(id: any, data: any) {
    return this.http.post(`${this.API_URL}updatetime`, {
      event_id: id,
      ...data,
    });
  }

  getRegisteredUser(eventId: any = null): Observable<any> {
    if (eventId) {
      return this.http.get(`${this.API_URL}registeredUser/${eventId}`);
    } else {
      return this.http.get(`${this.API_URL}registeredUser`);
    }
  }

  getUserEvent(): Observable<any> {
    const userId = this.getCurrentUserId();
    if (userId) {
      return this.http.get(`${this.API_URL}userevents/${userId}`);
    } else {
      return throwError('User ID not found');
    }
  }

  getUsersEvent(userId: number): Observable<Event[]> {
    if (userId) {
      return this.http.get<Event[]>(`${this.API_URL}userevents/${userId}`);
    } else {
      return throwError('User ID not found');
    }
  }

  registerForEvent(eventId: number, userId: any): Observable<any> {
    const data = { event_id: eventId, user_id: userId };
    return this.http.post(`${this.API_URL}register`, data);
  }

  unregisterForEvent(eventId: number, userId: any) {
    return this.http.delete(`${this.API_URL}unregister/${eventId}/${userId}`);
  }

  uploadEvent(eventId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.API_URL}uploadevent/${eventId}`, formData);
  }

  getEventImage(event_id: number): Observable<any> {
    return this.http.get(`${this.API_URL}geteventimage/${event_id}`, {
      responseType: 'blob',
    });
  }

  approveEvent(event_id: number, admin_id: number): Observable<any> {
    return this.http.post(`${this.API_URL}approveevent`, {
      event_id,
      admin_id,
    });
  }

  rejectEvent(
    event_id: number,
    admin_id: number,
    rejection_message: string
  ): Observable<any> {
    return this.http.post(`${this.API_URL}rejectevent/${event_id}`, {
      event_id,
      admin_id,
      rejection_message,
    });
  }

  cancelEvent(event_id: number, cancellation_reason: string): Observable<any> {
    return this.http.post(`${this.API_URL}cancelevent/${event_id}`, {
      cancellation_reason,
    });
  }

  endEvent(event_id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}endevent/${event_id}`);
  }

  //org
  getApprovedOrganizerEvents(org_id: any): Observable<any> {
    return this.http.get<any>(
      `${this.API_URL}getapprovedorganizerevents/${org_id}`
    );
  }

  getAllOrganizerEvents(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getallorganizerevents/${org_id}`);
  }

  //org getRegisteredUser
  getRegisteredUserInOrgEvent(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getregistereduser/${org_id}`);
  }

  getDataForDashboard(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getdatadashboard/${org_id}`);
  }

  getFeedbackEventOfOrgEvent(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getfeedbackoforgevent/${org_id}`);
  }

  getReport(event_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getreports/${event_id}`);
  }

  getOngoingReport(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getongoingreports/${org_id}`);
  }

  getUpcomingReport(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getupcomingreports/${org_id}`);
  }

  getDoneEventsOfOrg(org_id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}getdoneeventsoforg/${org_id}`);
  }

  certificate(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}certificate/${id}`);
  }
}
