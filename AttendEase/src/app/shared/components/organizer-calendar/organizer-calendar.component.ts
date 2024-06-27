import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MbscModule,
  MbscOptionsService,
  MbscCalendarEvent,
  MbscEventcalendarOptions,
  MbscEventcalendarView,
} from '@mobiscroll/angular';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/service/event.service';

@Component({
  selector: 'app-organizer-calendar',
  standalone: true,
  imports: [FormsModule, MbscModule, CommonModule],
  providers: [MbscOptionsService],
  templateUrl: './organizer-calendar.component.html',
  styleUrls: ['./organizer-calendar.component.css'],
})
export class OrganizerCalendarComponent implements OnInit {
  event: MbscCalendarEvent[] = [];

  view = 'month';
  calView: MbscEventcalendarView = {
    calendar: { labels: 1 },
  };

  eventSettings: MbscEventcalendarOptions = {
    theme: 'material',
    themeVariant: 'light',
    eventOverlap: true,
    data: this.event, // Bind the events to the calendar
  };

  constructor(private service: EventService) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.service.getAllEvents().subscribe(
      (res: any) => {
        console.log('Response:', res);
        if (res && Array.isArray(res)) {
          this.event = res.map((event: any) => ({
            start: new Date(event.event_start_date),
            end: new Date(event.event_end_date),
            title: event.event_name,
            description: event.event_description,
            status: event.status,
          }));
          console.log('Mapped Events:', this.event);
          this.eventSettings = {
            ...this.eventSettings,
            data: this.event,
          };
        } else {
          console.error('Invalid response format or payload missing');
        }
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  changeView(): void {
    setTimeout(() => {
      switch (this.view) {
        case 'month':
          this.calView = {
            calendar: { type: 'month' },
            agenda: { type: 'month' },
          };
          break;
        case 'week':
          this.calView = {
            calendar: { type: 'week' },
            agenda: { type: 'week' },
          };
          break;
        case 'day':
          this.calView = {
            agenda: { type: 'day' },
          };
          break;
      }
    });
  }
}
