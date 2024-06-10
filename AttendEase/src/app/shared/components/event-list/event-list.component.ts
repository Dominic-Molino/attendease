import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';

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

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
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

  viewFeedback(eventId: number) {
    this.router.navigate(['/admin/per-feedback/', eventId]);
  }
}
