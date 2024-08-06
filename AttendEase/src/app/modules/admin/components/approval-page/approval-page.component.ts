import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule, Location } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { switchMap, of, Observable, map } from 'rxjs';
import { Event } from '../../../../interfaces/EventInterface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-approval-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approval-page.component.html',
  styleUrl: './approval-page.component.css',
})
export class ApprovalPageComponent implements OnInit {
  events: Event[] = [];
  userId = this.service.getCurrentUserId();
  eventWithStatus?: any;
  isRejected = false;
  isApproved = false;
  eventId: any;

  constructor(
    private route: ActivatedRoute,
    private service: AuthserviceService,
    private evService: EventService,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      this.fetchEventDetails(this.eventId);
    });
  }

  fetchEventDetails(eventId: any) {
    this.evService.getEventById(eventId).subscribe({
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
            event_image$: this.getEventImage(event.event_id),
          }));
        }
      },
    });
  }

  getEventImage(eventId: number): Observable<SafeResourceUrl> {
    return this.evService.getEventImage(eventId).pipe(
      map((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      })
    );
  }

  approveEvent(): void {
    if (this.userId) {
      Swal.fire({
        title: 'Are you sure?',
        text: "Did you review the event details? You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!',
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.eventId && this.userId) {
            this.evService
              .approveEvent(this.eventId, this.userId)
              .subscribe((response) => {
                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 1500,
                  timerProgressBar: true,
                });
                Toast.fire({
                  icon: 'success',
                  title: 'Event Approved',
                });
                this.location.back();
              });
          }
        }
      });
    }
  }

  rejectEvent(): void {
    if (this.userId) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Please provide a reason for rejection:',
        input: 'textarea',
        inputPlaceholder: 'Type your reason here...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reject it!',
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const rejectionMessage = result.value;
          if (this.eventId && this.userId && rejectionMessage) {
            this.evService
              .rejectEvent(this.eventId, this.userId, rejectionMessage)
              .subscribe((response) => {
                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 1500,
                  timerProgressBar: true,
                });
                Toast.fire({
                  icon: 'success',
                  title: 'Event Rejected',
                });
                this.location.back();
              });
          }
        }
      });
    }
  }

  closePage() {
    this.location.back();
  }

  getFormattedTargetParticipants(participants: any[]): string {
    if (!Array.isArray(participants)) {
      console.error('Invalid participants data:', participants);
      return '';
    }

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
