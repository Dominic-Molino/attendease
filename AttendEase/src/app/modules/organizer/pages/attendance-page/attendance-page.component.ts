import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthserviceService } from '../../../../core/service/authservice.service';

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
  status?: string;
}

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, MatTooltipModule],
  templateUrl: './attendance-page.component.html',
  styleUrl: './attendance-page.component.css',
})
export class AttendancePageComponent implements OnInit {
  eventId?: number;
  currId: any;
  eventList: Event[] = [];

  p: number = 1;
  itemsPerPage: number = 10;
  maxSize: number = 5;

  constructor(
    private event: EventService,
    private router: Router,
    private service: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.currId = this.event.getCurrentUserId();
    this.loadDoneEvents(this.currId);
  }

  loadDoneEvents(id: any) {
    this.event.getApprovedOrganizerEvents(id).subscribe((res) => {
      this.eventList = res.payload.map((data: any): Event => {
        const eventId = data.event_id;
        const eventObject: Event = {
          event_id: data.event_id,
          event_name: data.event_name,
          event_description: data.event_description,
          event_location: data.event_location,
          event_start_date: data.event_start_date,
          event_end_date: data.event_end_date,
          event_registration_start: data.event_registration_start,
          event_registration_end: data.event_registration_end,
          session: data.session,
          status: this.getEventStatus(data),
        };
        return eventObject;
      });

      this.eventList.sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') {
          return -1;
        }
        if (a.status !== 'done' && b.status === 'done') {
          return 1;
        }
        if (a.status === 'ongoing' && b.status === 'upcoming') {
          return -1;
        }
        if (a.status === 'upcoming' && b.status === 'ongoing') {
          return 1;
        }
        return 0;
      });
    });
  }

  viewEvent(eventId: any) {
    const currentUserRole = this.service.getCurrentUserRole();
    let routePrefix = '';

    if (currentUserRole === 1) {
      routePrefix = 'admin/admin-view-attendance';
    } else if (currentUserRole === 2) {
      routePrefix = 'organizer/organizer-view-attendance';
    }

    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }

  getEventStatus(event: any): string {
    const currentDate = new Date();
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);

    if (endDate < currentDate) {
      return 'done';
    } else if (startDate <= currentDate && endDate >= currentDate) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }
}
