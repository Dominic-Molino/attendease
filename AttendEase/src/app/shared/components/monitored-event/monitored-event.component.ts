import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { Event } from '../../../interfaces/EventInterface';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { ContentObserver } from '@angular/cdk/observers';

@Component({
  standalone: true,
  imports: [MatTabsModule, CommonModule],
  selector: 'app-monitored-event',
  templateUrl: './monitored-event.component.html',
  styleUrls: ['./monitored-event.component.css'],
})
export class MonitoredEventComponent implements OnInit {
  events: Event[] = [];
  selectedEvent: Event | null = null;
  registeredUsers: any[] = [];
  registeredUsersMap: { [eventId: number]: any[] } = {};

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getAllEvents().subscribe((res: any) => {
      this.events = res.sort(
        (a: Event, b: Event) =>
          new Date(b.event_start_date).getTime() -
          new Date(a.event_start_date).getTime()
      );
      console.log(this.events);

      // Load registered users for each event
      this.events.forEach((event) => {
        this.loadRegisteredUsers(event.event_id);
      });
    });
  }

  loadRegisteredUsers(eventId: number): void {
    this.eventService.getRegisteredUser(eventId).subscribe((res: any) => {
      console.log(`Registered users for event ${eventId}:`, res.payload);
      this.registeredUsersMap[eventId] = res.payload || [];
      console.log(this.registeredUsersMap);
    });
  }
}
