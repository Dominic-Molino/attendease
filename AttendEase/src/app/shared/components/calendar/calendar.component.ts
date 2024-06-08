import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { EventService } from '../../../core/service/event.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';
import { AddEventComponent } from '../../../modules/organizer/components/add-event/add-event.component';
import { AuthserviceService } from '../../../core/service/authservice.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  calendarEvents: EventInput[] = [];
  event: any[] = [];
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
    dayMaxEvents: true,
    selectable: true,
    height: 'auto',
    eventColor: '#deac80',
    aspectRatio: 1,
    validRange: {
      start: new Date().toISOString().split('T')[0],
    },
    windowResize: this.handleWindowResize.bind(this),
    eventClick: this.handleEventClick.bind(this),
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

  fetchEvents() {
    this.service.getAllEvents().subscribe((data) => {
      const events = data.payload;
      this.calendarEvents = events.map((event: any) => ({
        id: event.event_id,
        title: event.event_name,
        start: event.event_start_date,
        end: event.event_end_date,
      }));
    });
  }

  handleDateClick(arg: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { startDate: arg.date };
    dialogConfig.width = '50%';
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(AddEventComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchEvents();
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.service.getEventById(clickInfo.event.id).subscribe((event) => {
      const eventData = event.payload[0];
      const dialogRef = this.dialog.open(PopupComponent, {
        data: eventData,
        disableClose: true,
        panelClass: 'dialog-container',
      });

      dialogRef.afterClosed().subscribe((result) => {});
    });
  }

  handleWindowResize(view: any) {
    const aspectRatio = window.innerWidth < 768 ? 1 : 1.35;
    this.calendarOptions.update((options) => {
      options.aspectRatio = aspectRatio;
      return options;
    });
  }
}
