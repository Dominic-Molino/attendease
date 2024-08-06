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
import { map, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Event } from '../../../../interfaces/EventInterface';
import { MessageComponent } from '../../../../shared/components/message/message.component';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  year_level: string;
  course: string;
  block: string;
  email: string;
  role_id: number;
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
    MessageComponent,
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
  user?: User;
  canRegister = false;
  isUnregistering = false;

  private refreshSubscription: Subscription | undefined;

  constructor(
    private service: EventService,
    private userService: AuthserviceService,
    private sanitizer: DomSanitizer,
    private router: ActivatedRoute,
    private route: Router,
    private location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      this.fetchEventDetails(this.eventId);
    });
    this.getStudentInfo();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  openChat(organizerId: any) {
    const openDia = this.dialog.open(MessageComponent, {
      data: {
        currentUser: this.userId,
        otherUser: organizerId,
      },
      width: '50%',
    });
  }

  getStudentInfo(): void {
    this.userService.getStudentProfile(this.userId).subscribe(
      (response: any) => {
        if (response.payload && response.payload.length > 0) {
          this.user = response.payload[0];
          console.log('User fetched:', this.user);
          this.checkEligibility();
        } else {
          console.error('User data not found in API response:', response);
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
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
        this.checkEligibility();
      },
    });
    this.checkUserRegistration();
    this.getStudentInfo();
  }

  checkEligibility(): void {
    if (this.events.length > 0 && this.user) {
      console.log('User:', this.user);

      const targetParticipants = this.events[0].target_participants;
      const isEventOpenForAll = this.events[0].participation_type === 'open';

      if (isEventOpenForAll) {
        this.canRegister = true; // Directly allow registration if open for all
      } else {
        this.canRegister = targetParticipants.some((participant: any) => {
          const isSameDepartment = participant.department === this.user?.course;
          console.log('Department check:', isSameDepartment);
          console.log(
            `Department: ${participant.department} || Course: ${this.user?.course}`
          );

          const yearLevels = participant.year_levels
            .split(', ')
            .map((level: any) => level.trim());
          const isSameYearLevel = yearLevels.includes(this.user?.year_level);
          console.log('Year Level check:', isSameYearLevel);
          console.log(
            `Year Levels: ${yearLevels} || User Year Level: ${this.user?.year_level}`
          );

          return isSameDepartment && isSameYearLevel;
        });
      }

      console.log('Can Register:', this.canRegister);
    }
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
    const event = this.events.find((e) => e.event_id === eventId);

    if (!this.canRegister) {
      Swal.fire(
        'Warning',
        'You are not eligible to register for this event.',
        'warning'
      );
      return;
    }

    if (event?.participation_type === 'open' || this.canRegister) {
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
              this.fetchEventDetails(this.eventId);
            },
            (error) => {
              if (error.status === 409) {
                console.log(error);
                Swal.fire({
                  title: 'Warning',
                  html: `<p>${error.error.status.message}:</p><br><h1>${error.error.payload.event_name}</h1>`,
                  icon: 'warning',
                  footer:
                    '<a href="http://localhost:4200/student/registeredeventhistory">View your registered events.</a>',
                });
              } else {
                Swal.fire(
                  'Warning',
                  `${error.error.status.message}`,
                  'warning'
                );
              }
            }
          );
        }
      });
    }
  }

  unregister(eventId: number) {
    if (this.isUnregistering) return;
    this.isUnregistering = true;

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
            this.route.navigate(['student/registeredeventhistory']);
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
