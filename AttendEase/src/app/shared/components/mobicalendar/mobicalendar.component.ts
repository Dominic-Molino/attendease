import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { Router } from '@angular/router';

interface CustomCalendarEvent extends MbscCalendarEvent {
  status: 'done' | 'ongoing' | 'upcoming';
  categories: { display: string; value: string }[];
}

@Component({
  selector: 'app-mobicalendar',
  standalone: true,
  imports: [FormsModule, MbscModule, CommonModule],
  providers: [MbscOptionsService],
  templateUrl: './mobicalendar.component.html',
  styleUrl: './mobicalendar.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class MobicalendarComponent {
  events: CustomCalendarEvent[] = [];
  userId: any;
  private subscription?: Subscription;

  view = 'month';
  calView: MbscEventcalendarView = {
    calendar: { labels: 1 },
  };

  eventSettings: MbscEventcalendarOptions = {
    theme: 'material',
    themeVariant: 'light',
    eventOverlap: true,
    colors: [
      {
        date: this.events.map((event: any) => {
          start: event.start;
        }),
        background: '#f3c3d480',
      },
    ],
    onEventClick: (args) => {
      this.openPreviewDialog(args.event['event_id']);
    },
  };

  constructor(
    protected options: MbscOptionsService,
    private eventService: EventService,
    private auth: AuthserviceService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getCurrentUserRole();
    this.fetchUserEvents();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  fetchUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res: any) => {
        if (res && res.payload && Array.isArray(res.payload)) {
          this.events = res.payload.map((event: any) => ({
            ...event,
            start: new Date(event.event_start_date),
            end: new Date(event.event_end_date),
            title: event.event_name,
          }));
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

  openPreviewDialog(eventId: number): void {
    if (!eventId) {
      console.error('Event data is null or undefined.');
      return;
    } else {
      this.router.navigate([`/student/preview/${eventId}`]);
    }
  }
}
