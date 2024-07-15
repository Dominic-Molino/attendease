import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';
import { Observable, catchError, map, of } from 'rxjs';
import { MobicalendarComponent } from '../../components/mobicalendar/mobicalendar.component';
import { UserEvents } from '../../../../interfaces/UserEvents';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [CommonModule, RouterLink, MobicalendarComponent],
})
export class DashboardComponent implements OnInit {
  events$?: Observable<UserEvents[]>;

  constructor(private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    this.events$ = this.getUserEvents();
  }

  getUserEvents(): Observable<UserEvents[]> {
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
            } as UserEvents;
          });

          const filteredEvents = events.filter(
            (event: any) => event.eventState !== 'done'
          );

          filteredEvents.sort((a: any, b: any) => {
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

          return filteredEvents;
        } else {
          return [];
        }
      }),
      catchError((error) => {
        const errorMessage =
          error.error?.status?.message || 'An error occurred';
        console.error(errorMessage);
        return of([]);
      })
    );
  }

  onClickButton(): void {
    this.router.navigate(['student/registeredeventhistory']);
  }

  goToPreview(eventId: number): void {
    this.router.navigate([`student/preview/${eventId}`]);
  }
}
