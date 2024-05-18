import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEventComponent } from '../../components/add-event/add-event.component';
import { CommonModule } from '@angular/common';
import { DeleteEventComponent } from '../../components/delete-event/delete-event.component';
import { EditEventComponent } from '../../components/edit-event/edit-event.component';
import { ReadEventComponent } from '../../components/read-event/read-event.component';
import { EventService } from '../../../../core/service/event.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_start_date: Date;
  event_end_date: Date;
  event_registration_start: Date;
  event_registration_end: Date;
  event_image: SafeResourceUrl | undefined;
}

@Component({
  selector: 'app-org-event',
  standalone: true,
  templateUrl: './org-event.component.html',
  styleUrl: './org-event.component.css',
  imports: [
    MatDialogModule,
    CommonModule,
    DeleteEventComponent,
    EditEventComponent,
  ],
})
export class OrgEventComponent implements OnInit {
  eventData: any;
  selectedEventId: any;
  eventList: Event[] = [];
  eventImage: any[] = [];

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent() {
    this.service.getAllEvents().subscribe((result) => {
      this.eventList = result.payload.map((data: any): Event => {
        const eventId = data.event_id;
        const eventObject: Event = {
          event_id: data.event_id,
          event_name: data.event_name,
          event_description: data.event_description,
          event_location: data.event_location,
          event_start_date: data.event_start_date,
          event_end_date: data.event_end_date,
          event_registration_start: data.event_registration_start,
          event_registration_end: data.event_registration_end,
          event_image: undefined,
        };

        this.service.getEventImage(eventId).subscribe((imageResult) => {
          if (imageResult.size > 0) {
            const url = URL.createObjectURL(imageResult);
            eventObject.event_image =
              this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
        });
        return eventObject;
      });
    });
  }

  openDialog() {
    const modal = this.dialog.open(AddEventComponent, {
      width: '50%',
    });

    modal.afterClosed().subscribe((response) => {
      this.loadEvent();
    });
  }

  editEvent(eventId: any) {
    this.selectedEventId = eventId;
    const modal = this.dialog.open(EditEventComponent, {
      data: { event_id: this.selectedEventId },
      width: '75%',
    });
    modal.afterClosed().subscribe((response) => {
      this.loadEvent();
    });
    console.log(this.selectedEventId);
  }

  viewEvent(event: any) {
    this.dialog.open(ReadEventComponent, {
      data: { event },
      width: '50%',
    });
  }
}
