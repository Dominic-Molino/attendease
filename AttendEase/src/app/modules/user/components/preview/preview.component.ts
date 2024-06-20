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

interface Event {
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
  categories: { display: string; value: string }[];
  organizer_name: string;
  status?: 'done' | 'ongoing' | 'upcoming';
}

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
  event: Event[] = [];
  userId = this.userService.getCurrentUserId();
  eventWithStatus?: any;
  isRegistered = false;
  eventImage$: Observable<SafeResourceUrl | undefined> | undefined;
  eventId: any;

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

    // Setup polling to refresh event details every 30 seconds
    this.setupPolling();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  setupPolling() {
    const pollingIntervalMs = 30000; // 30 seconds

    this.refreshSubscription = timer(3000, pollingIntervalMs)
      .pipe(switchMap(() => this.service.getEventById(this.eventId)))
      .subscribe(
        (response) => {
          if (response.status.remarks === 'success') {
            this.event = response.payload.map((ev: any): Event => {
              const categories: { display: string; value: string }[] =
                JSON.parse(ev.categories);
              return {
                event_id: ev.event_id,
                event_name: ev.event_name,
                event_description: ev.event_description,
                event_location: ev.event_location,
                event_start_date: new Date(ev.event_start_date),
                event_end_date: new Date(ev.event_end_date),
                event_registration_start: new Date(ev.event_registration_start),
                event_registration_end: new Date(ev.event_registration_end),
                session: ev.session,
                max_attendees: ev.max_attendees,
                categories: categories,
                organizer_name: ev.organizer_name.replace(/^"|"$/g, ''),
              };
            });

            this.eventImage$ = this.service.getEventImage(this.eventId).pipe(
              switchMap((imageResult) => {
                if (imageResult.size > 0) {
                  const url = URL.createObjectURL(imageResult);
                  return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
                } else {
                  return of(undefined);
                }
              })
            );
            this.checkUserRegistration();
            this.setEventStatus();
          }
        },
        (error) => {
          console.error('Error fetching event details:', error);
        }
      );
  }

  fetchEventDetails(eventId: number): void {
    this.service.getEventById(eventId).subscribe((response) => {
      if (response.status.remarks === 'success') {
        this.event = response.payload.map((ev: any): Event => {
          const categories: { display: string; value: string }[] = JSON.parse(
            ev.categories
          );
          return {
            event_id: ev.event_id,
            event_name: ev.event_name,
            event_description: ev.event_description,
            event_location: ev.event_location,
            event_start_date: new Date(ev.event_start_date),
            event_end_date: new Date(ev.event_end_date),
            event_registration_start: new Date(ev.event_registration_start),
            event_registration_end: new Date(ev.event_registration_end),
            session: ev.session,
            max_attendees: ev.max_attendees,
            categories: categories,
            organizer_name: ev.organizer_name.replace(/^"|"$/g, ''),
          };
        });

        this.eventImage$ = this.service.getEventImage(eventId).pipe(
          switchMap((imageResult) => {
            if (imageResult.size > 0) {
              const url = URL.createObjectURL(imageResult);
              return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
            } else {
              return of(undefined);
            }
          })
        );
        this.checkUserRegistration();
        this.setEventStatus();
      }
    });
  }

  setEventStatus(): void {
    const currentDate = new Date();
    this.event.forEach((ev) => {
      if (currentDate > ev.event_end_date) {
        ev['status'] = 'done';
      } else if (
        currentDate >= ev.event_start_date &&
        currentDate <= ev.event_end_date
      ) {
        ev['status'] = 'ongoing';
      } else if (currentDate < ev.event_start_date) {
        ev['status'] = 'upcoming';
      }
    });
  }

  checkUserRegistration(): void {
    this.service.getUserEvent().subscribe((res) => {
      const userEvent = res.payload;
      this.isRegistered = userEvent.some(
        (event: any) => event.event_id === this.eventId
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
}
