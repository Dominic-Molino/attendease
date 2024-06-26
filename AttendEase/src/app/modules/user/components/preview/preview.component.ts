import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  Location,
  TitleCasePipe,
} from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, Subscription, interval, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Event } from '../../../../interfaces/EventInterface';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    CommonModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  userId = this.userService.getCurrentUserId();
  eventWithStatus?: any;
  isRegistered = false;
  eventImage$: Observable<SafeResourceUrl | undefined> | undefined;
  eventId: any;
  userEvents: Event[] = [];

  private refreshSubscription: Subscription | undefined;

  constructor(
    private service: EventService,
    private userService: AuthserviceService,
    private sanitizer: DomSanitizer,
    private router: ActivatedRoute,
    private route: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      this.fetchEventDetails(this.eventId);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  fetchEventDetails(eventId: number): void {
    this.service.getEventById(eventId).subscribe({
      next: (result: any) => {
        if (result && Array.isArray(result)) {
          this.events = result.map((event) => ({
            ...event,
            event_start_date: new Date(event.event_start_date),
            event_end_date: new Date(event.event_end_date),
            event_registration_start: new Date(event.event_registration_start),
            event_registration_end: new Date(event.event_registration_end),
            categories: JSON.parse(event.categories),
            target_participants: JSON.parse(event.target_participants),
            event_image$: this.service.getEventImage(event.event_id).pipe(
              switchMap((imageResult) => {
                if (imageResult.size > 0) {
                  const url = URL.createObjectURL(imageResult);
                  return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
                } else {
                  return of(undefined);
                }
              })
            ),
          }));
        }
        console.log(this.events);
      },
    });
    this.checkUserRegistration();
  }

  checkUserRegistration(): void {
    this.service.getUserEvent().subscribe((res) => {
      const userEvent = res.payload;
      this.userEvents = userEvent.map((event: any) => ({
        ...event,
        event_start_date: new Date(event.event_start_date),
        event_end_date: new Date(event.event_end_date),
      }));
      this.isRegistered = this.userEvents.some(
        (event) => event.event_id === this.eventId
      );
    });
  }

  registerForEvent(eventId: number) {
    Swal.fire({
      title: 'Register to this event?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.registerForEvent(eventId, this.userId).subscribe(
          (response) => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Successfully registered',
            });
          },
          (error) => {
            Swal.fire('Warning', `${error.error.status.message}`, 'warning');
          }
        );
      }
    });
  }

  unregister(eventId: number) {
    Swal.fire({
      title: 'Unregister from this event?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.unregisterForEvent(eventId, this.userId).subscribe(
          (response) => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Successfully unregistered',
            });
          },
          (error) => {
            Swal.fire('Warning', `${error.error.status.message}`, 'warning');
          }
        );
      }
    });
  }

  closePage() {
    this.location.back();
  }

  getFormattedTargetParticipants(participants: any[]): string {
    const groupedParticipants: { [key: string]: string[] } = {};

    participants.forEach((participant) => {
      if (!groupedParticipants[participant.department]) {
        groupedParticipants[participant.department] = [];
      }
      groupedParticipants[participant.department].push(participant.year_levels);
    });

    return Object.keys(groupedParticipants)
      .map((department) => {
        const years = groupedParticipants[department].join(', ');
        return `${department} - ${years}`;
      })
      .join(' | ');
  }
}
