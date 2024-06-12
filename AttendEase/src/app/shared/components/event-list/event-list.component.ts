import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';
import { AuthserviceService } from '../../../core/service/authservice.service';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_start_date: Date;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
  imports: [CommonModule, RouterLink, RouterOutlet, FeedbackListComponent],
})
export class EventListComponent implements OnInit {
  eventList: Event[] = [];
  maxChar: number = 100;
  currUser: any;

  constructor(
    private eventService: EventService,
    private router: Router,
    private service: AuthserviceService
  ) {
    this.currUser = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadEvents();
    console.log(this.currUser);
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe((res) => {
      this.eventList = res.payload.map((data: any): Event => {
        return {
          event_id: data.event_id,
          event_name: data.event_name,
          event_description: data.event_description,
          event_start_date: data.event_start_date,
        };
      });
    });
  }

  truncateDescription(text: string, maxLength: number): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }

  viewFeedback(eventId: number) {
    const currentUserRole = this.service.getCurrentUserRole();
    let routePrefix = '';

    if (currentUserRole === 1) {
      routePrefix = '/admin/admin-per-feedback';
    } else if (currentUserRole === 2) {
      routePrefix = '/organizer/org-per-feedback';
    }

    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }
}
