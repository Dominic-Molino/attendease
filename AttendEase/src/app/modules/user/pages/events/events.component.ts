import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { PreviewComponent } from '../../components/preview/preview.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService } from '../../../../core/service/event.service';
import { Observable, of, switchMap } from 'rxjs';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_start_date: Date;
  event_end_date: Date;
  event_registration_start: Date;
  event_registration_end: Date;
  session: string;
  max_attendees: number;
  event_image$: Observable<SafeResourceUrl | undefined>;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private service: AuthserviceService,
    private sanitizer: DomSanitizer,
    private eventService: EventService
  ) {}

  eventData: any;
  maxChar: number = 100;
  eventList: Event[] = [];

  ngOnInit(): void {
    this.service.getAllEvents().subscribe((result) => {
      this.eventList = result.payload.map((data: any): Event => {
        const eventObject: Event = {
          event_id: data.event_id,
          event_name: data.event_name,
          event_description: data.event_description,
          event_location: data.event_location,
          event_start_date: data.event_start_date,
          event_end_date: data.event_end_date,
          event_registration_start: data.event_registration_start,
          event_registration_end: data.event_registration_end,
          session: data.session,
          max_attendees: data.max_attendees,
          event_image$: this.eventService.getEventImage(data.event_id).pipe(
            switchMap((imageResult) => {
              if (imageResult.size > 0) {
                const url = URL.createObjectURL(imageResult);
                return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
              } else {
                return of(undefined);
              }
            })
          ),
        };
        return eventObject;
      });
    });
  }

  viewEvent(event: any) {
    this.dialog.open(PreviewComponent, {
      data: { event },
      width: '50%',
    });
  }

  truncateDescription(text: string, maxLength: number): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }
}
