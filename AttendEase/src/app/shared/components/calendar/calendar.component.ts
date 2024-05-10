import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { MatDialog } from '@angular/material/dialog';
import { PreviewComponent } from '../../../modules/user/components/preview/preview.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  calendarEvents: EventInput[] = [];

  constructor(private service: AuthserviceService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents() {
    this.service.getAllEvents().subscribe((data) => {
      const events = data.payload;
      this.calendarEvents = events.map((event: any) => ({
        title: event.event_name,
        start: event.event_start_date,
        end: event.event_end_date,
      }));
    });
  }

  calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'prev next today',
      right: 'title',
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    dayMaxEvents: true,
  });
}
