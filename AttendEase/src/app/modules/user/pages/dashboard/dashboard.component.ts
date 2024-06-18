import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarComponent } from '../../../../shared/components/calendar/calendar.component';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';
import { Observable, catchError, map } from 'rxjs';
import Swal from 'sweetalert2';
import { PrimecalendarComponent } from '../../../../shared/components/primecalendar/primecalendar.component';

interface UserEvent {
  event_id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_start_date: Date;
  event_end_date: Date;
  event_registration_start: Date;
  event_registration_end: Date;
  session: string;
  max_attendees: number;
  categories: string[];
  organizer_name: string;
  eventState: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [
    CommonModule,
    CalendarComponent,
    RouterLink,
    PrimecalendarComponent,
  ],
})
export class DashboardComponent implements OnInit {
  events$?: Observable<UserEvent[]>;

  constructor(private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    this.events$ = this.getUserEvents();
  }

  getUserEvents(): Observable<UserEvent[]> {
    return this.eventService.getUserEvent().pipe(
      map((res) => {
        if (res && res.payload) {
          const events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const endDate = new Date(event.event_end_date);
            const eventStartDate = new Date(event.event_start_date);

            let eventState = '';
            if (endDate < currentDate) {
              eventState = 'done';
            } else if (eventStartDate <= currentDate) {
              eventState = 'ongoing';
            } else {
              eventState = 'upcoming';
            }

            return {
              ...event,
              eventState,
            } as UserEvent;
          });

          // Sorting logic
          events.sort((a: any, b: any) => {
            if (
              a.eventState === 'done' &&
              (b.eventState === 'ongoing' || b.eventState === 'upcoming')
            ) {
              return -1;
            } else if (
              a.eventState === 'ongoing' &&
              b.eventState === 'upcoming'
            ) {
              return -1;
            } else if (
              a.eventState === 'upcoming' &&
              (b.eventState === 'done' || b.eventState === 'ongoing')
            ) {
              return 1;
            } else {
              return 0;
            }
          });

          return events;
        } else {
          return [];
        }
      }),
      catchError((error) => {
        const errorMessage =
          error.error?.status?.message || 'An error occurred';
        return [];
      })
    );
  }

  onClickButton(): void {
    this.router.navigate(['student/events']);
  }
}
