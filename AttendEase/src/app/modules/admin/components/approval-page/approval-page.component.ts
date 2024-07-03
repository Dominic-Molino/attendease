import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule, Location } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { switchMap, of, Observable } from 'rxjs';
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
  isRegistered = false;
  eventImage$: Observable<SafeResourceUrl | undefined> | undefined;
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

  fetchEventDetails(eventId: number): void {
    if (eventId) {
      this.evService.getEvents(eventId).subscribe((res: any) => {
        this.events = res.payload;
      });
    }
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
                  didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                  },
                });
                Toast.fire({
                  icon: 'success',
                  title: 'Event Approved',
                });
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
                  didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                  },
                });
                Toast.fire({
                  icon: 'success',
                  title: 'Event Rejected',
                });
              });
          }
        }
      });
    }
  }

  closePage() {
    this.location.back();
  }
}
