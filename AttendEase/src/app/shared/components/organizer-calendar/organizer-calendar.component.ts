import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
})
export class OrganizerCalendarComponent implements OnInit {
  event: MbscCalendarEvent[] = [];
  currId: any;
  @ViewChild('eventcalendar') eventcalendar: any;

  view = 'month';
  calView: MbscEventcalendarView = {
    agenda: { type: 'day' },
  };

  eventSettings: MbscEventcalendarOptions = {
    theme: 'material',
    themeVariant: 'light',
    eventOverlap: true,
    data: this.event,
  };

  constructor(private service: EventService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.fetchEvents(this.currId);
  }

  fetchEvents(id: any): void {
    this.service.getApprovedOrganizerEvents(id).subscribe(
      (res: any) => {
        if (res.payload && Array.isArray(res.payload)) {
          this.event = res.payload.map((event: any) => ({
            start: new Date(event.event_start_date),
            end: new Date(event.event_end_date),
            title: event.event_name,
            description: event.event_description,
            status: event.status,
          }));
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

  onPageLoading(event: any): void {
    this.fetchEvents(this.currId);
  }
}
