import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { Observable, catchError, map } from 'rxjs';
import { UserEvents } from '../../../../interfaces/UserEvents';
import { initFlowbite } from 'flowbite';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eventhistory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventhistory.component.html',
  styleUrl: './eventhistory.component.css',
})
export class EventhistoryComponent implements OnInit {
  events$?: Observable<UserEvents[]>;

  constructor(
    private location: Location,
    private service: EventService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    this.events$ = this.getUserEvents();
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }

  getUserEvents(): Observable<UserEvents[]> {
    return this.service.getUserEvent().pipe(
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

          // const filteredEvents = events.filter(
          //   (event: any) => event.eventState !== 'done'
          // );

          // filteredEvents.sort((a: any, b: any) => {
          //   if (
          //     a.eventState === 'done' &&
          //     (b.eventState === 'ongoing' || b.eventState === 'upcoming')
          //   ) {
          //     return -1;
          //   } else if (
          //     a.eventState === 'ongoing' &&
          //     b.eventState === 'upcoming'
          //   ) {
          //     return -1;
          //   } else if (
          //     a.eventState === 'upcoming' &&
          //     (b.eventState === 'done' || b.eventState === 'ongoing')
          //   ) {
          //     return 1;
          //   } else {
          //     return 0;
          //   }
          // });

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

  openEvent(eventId: number) {
    let routePrefix = '/student/preview';
    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }

  closePage() {
    this.location.back();
  }
}
