import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { PreviewComponent } from '../../components/preview/preview.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService } from '../../../../core/service/event.service';
import { Observable, of, switchMap } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

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
  event_categories: string;
  organizer_name: string;
  event_image$: Observable<SafeResourceUrl | undefined>;
}

@Component({
  selector: 'app-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, NgxPaginationModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  eventData: any;
  maxChar: number = 100;
  eventList: Event[] = [];

  constructor(
    private dialog: MatDialog,
    private service: AuthserviceService,
    private sanitizer: DomSanitizer,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.service.getAllEvents().subscribe((result) => {
      console.log(result.payload);
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
          event_categories: data.event_categories,
          organizer_name: data.organizer_name,
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
      this.cdr.markForCheck();
    });
  }

  viewEvent(event: any) {
    this.dialog.open(PreviewComponent, {
      data: { event },
      panelClass: 'dialog-container',
      disableClose: true,
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
