import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { EventService } from '../../../../core/service/event.service';
import { DeleteEventComponent } from '../../components/delete-event/delete-event.component';
import { CommonModule } from '@angular/common';
import { MarkattendanceeComponent } from '../../components/markattendancee/markattendancee.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  status?: string;
  event_image: SafeResourceUrl | undefined;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
  imports: [
    DeleteEventComponent,
    CommonModule,
    NgxPaginationModule,
    MatTooltipModule,
  ],
})
export class AttendanceComponent implements OnInit {
  eventData: any;
  selectedEventId: any;
  eventList: Event[] = [];
  maxChar = 100;

  //paginate variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize: number = 5;

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router
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
          session: data.session,
          status: this.getEventStatus(data),
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

      this.eventList.sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') {
          return -1;
        }
        if (a.status !== 'done' && b.status === 'done') {
          return 1;
        }
        if (a.status === 'ongoing' && b.status === 'upcoming') {
          return -1;
        }
        if (a.status === 'upcoming' && b.status === 'ongoing') {
          return 1;
        }
        return 0;
      });
    });
  }

  // viewEvent(eventId: any) {
  //   this.dialog.open(MarkattendanceeComponent, {
  //     width: '70%',
  //     height: '90%',
  //     disableClose: true,
  //     data: {
  //       selectedEvent: eventId,
  //     },
  //   });
  // }

  viewEvent(eventId: any) {
    let routePrefix = '/admin/admin-view-attendance';
    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }

  getEventStatus(event: any): string {
    const currentDate = new Date();
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);

    if (endDate < currentDate) {
      return 'done';
    } else if (startDate <= currentDate && endDate >= currentDate) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }
}
