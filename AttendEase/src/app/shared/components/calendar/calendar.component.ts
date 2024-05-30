import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { EventService } from '../../../core/service/event.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  calendarEvents: EventInput[] = [];
  calendarVisible = signal(true);
  event: any[] = [];

  calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'prev next today',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    initialView: 'dayGridMonth',
    weekends: true,
    dayMaxEvents: true,
    selectable: true,
    height: 500,
    aspectRatio: 1,
    eventClick: this.handleEventClick.bind(this),
  });

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
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

  handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.service.getEventById(clickInfo.event.id).subscribe((event) => {
      const eventData = event.payload[0];
      console.log(eventData);
      const dialogRef = this.dialog.open(PopupComponent, {
        data: eventData,
        width: '50%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog closed with result:', result);
      });
    });
  }
}
