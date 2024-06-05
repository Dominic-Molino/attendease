import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEventComponent } from '../../components/add-event/add-event.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeleteEventComponent } from '../../components/delete-event/delete-event.component';
import { EditEventComponent } from '../../components/edit-event/edit-event.component';
import { ReadEventComponent } from '../../components/read-event/read-event.component';
import { EventService } from '../../../../core/service/event.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { initFlowbite } from 'flowbite';
import { CalendarComponent } from '../../../../shared/components/calendar/calendar.component';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Observable, filter, map } from 'rxjs';

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
  event_image: SafeResourceUrl | undefined;
  event_image$?: Observable<SafeResourceUrl>;
  status?: string;
  total_attendees?: number;
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
    CalendarComponent,
    TableModule,
    PaginatorModule,
  ],
})
export class OrgEventComponent implements OnInit {
  eventData: any;
  selectedEventId: any;
  eventList: Event[] = [];
  maxChar = 100;
  eventId: any;
  filteredEventList: Event[] = [];
  currentFilter: string = 'all';
  isDropdownOpen: boolean = false;

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.loadEvent();
  }

  loadEvent() {
    this.service.getAllEvents().subscribe((result) => {
      this.eventList = result.payload.map((data: any): Event => {
        this.eventId = data.event_id;
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
          event_image: undefined,
          status: this.getEventStatus(data),
          event_image$: undefined,
        };

        this.service.getEventImage(this.eventId).subscribe((imageResult) => {
          if (imageResult.size > 0) {
            const url = URL.createObjectURL(imageResult);
            eventObject.event_image =
              this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
        });

        this.service.getTotal(this.eventId).subscribe((res) => {
          eventObject.total_attendees = res.payload;
        });

        return eventObject;
      });

      this.applyFilter(this.currentFilter);
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  applyFilter(status: string) {
    this.currentFilter = status;
    this.isDropdownOpen = false;
    if (status === 'all') {
      this.filteredEventList = this.eventList;
    } else {
      this.filteredEventList = this.eventList.filter(
        (event) => event.status === status
      );
    }
  }

  onFileChange(event: any, eventId: number) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      this.service.uploadEvent(eventId, file).subscribe((data) => {
        Swal.fire('Success', 'Image uploaded successfully', 'success');
        this.loadEvent();
        this.resetInput(event.target);
      });
    }
  }

  resetInput(inputElement: HTMLInputElement) {
    if (inputElement) {
      inputElement.value = '';
    }
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
      width: '50%',
    });
    modal.afterClosed().subscribe((response) => {
      this.loadEvent();
    });
  }

  viewEvent(event: any) {
    this.dialog.open(ReadEventComponent, {
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
