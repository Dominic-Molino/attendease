import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  EventInput,
  EventContentArg,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { EventService } from '../../../core/service/event.service';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AddEventComponent } from '../../../modules/organizer/components/add-event/add-event.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  calendarEvents: EventInput[] = [];
  userRole: number | null = null;

  calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    initialView: 'dayGridMonth',
    weekends: true,
    dayMaxEvents: 1,
    selectable: true,
    height: 'auto',
    eventColor: '#04bc64',
    aspectRatio: 1,
    validRange: {
      start: new Date().toISOString().split('T')[0],
    },
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this),
  });

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private auth: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.userRole = this.auth.getCurrentUserRole();
    if (this.userRole === 2) {
      this.calendarOptions.update((options) => {
        options.dateClick = this.handleDateClick.bind(this);
        return options;
      });
    }
  }

  fetchEvents(): void {
    this.service
      .getAllEvents()
      .pipe(
        catchError((error) => {
          console.error('Error fetching events:', error);
          return of([]);
        })
      )
      .subscribe((data) => {
        const events = data.payload || [];
        this.calendarEvents = events.map((event: any) => ({
          id: event.event_id,
          title: event.event_name,
          start: event.event_start_date,
          end: event.event_end_date,
        }));
      });
  }

  handleDateClick(arg: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { startDate: arg.date };
    dialogConfig.width = '70%';
    dialogConfig.height = '90%';
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(AddEventComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchEvents();
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    this.service
      .getEventById(clickInfo.event.id)
      .pipe(
        catchError((error) => {
          console.error('Error fetching event details:', error);
          return of(null);
        })
      )
      .subscribe((event) => {
        const eventData = event?.payload[0];
        if (eventData) {
          const dialogRef = this.dialog.open(PopupComponent, {
            data: eventData,
            disableClose: true,
            width: '70%',
            height: '90%',
            panelClass: 'dialog-container',
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.fetchEvents();
            }
          });
        }
      });
  }

  renderEventContent(eventContent: EventContentArg) {
    return {
      html: `<div class="text-light-text border border-light-border bg-white hover:bg-light-background hover:text-white cursor-pointer px-2.5 py-2  rounded-md truncate text-ellipsis" >${eventContent.event.title}</div>`,
    };
  }
}
