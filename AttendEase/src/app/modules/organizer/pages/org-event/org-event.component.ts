import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEventComponent } from '../../components/add-event/add-event.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeleteEventComponent } from '../../components/delete-event/delete-event.component';
import { EditEventComponent } from '../../components/edit-event/edit-event.component';
import { EventService } from '../../../../core/service/event.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { initFlowbite } from 'flowbite';
import { CalendarComponent } from '../../../../shared/components/calendar/calendar.component';
import { Observable } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdateimageComponent } from '../../components/updateimage/updateimage.component';

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
  categories: string[];
  organizer_name: string;
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
    NgxPaginationModule,
  ],
})
export class OrgEventComponent implements OnInit {
  eventList: Event[] = [];
  filteredEventList: any[] = [];
  maxChar = 100;
  selectedEventId: any;
  currentFilter: string = 'all';
  isDropdownOpen: boolean = false;

  //pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

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
          max_attendees: data.max_attendees,
          categories: data.categories,
          organizer_name: data.organizer_name,
          event_image: undefined,
          status: this.getEventStatus(data),
          event_image$: undefined,
        };

        this.service.getEventImage(eventId).subscribe((imageResult) => {
          if (imageResult.size > 0) {
            const url = URL.createObjectURL(imageResult);
            eventObject.event_image =
              this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
        });

        this.service.getTotal(eventId).subscribe((res) => {
          eventObject.total_attendees = res.payload;
        });

        return eventObject;
      });

      this.eventList.sort((a, b) => {
        if (
          a.status === 'done' &&
          (b.status === 'ongoing' || b.status === 'upcoming')
        ) {
          return -1;
        } else if (a.status === 'ongoing' && b.status === 'upcoming') {
          return -1;
        } else if (
          a.status === 'upcoming' &&
          (b.status === 'done' || b.status === 'ongoing')
        ) {
          return 1;
        } else {
          return 0;
        }
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
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Image uploaded successfully.',
        });
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
      width: '70%',
      height: '90%',
      disableClose: true,
    });

    modal.afterClosed().subscribe((response) => {
      this.loadEvent();
    });
  }

  openFile(eventId: number) {
    const dialogRef = this.dialog.open(UpdateimageComponent, {
      data: { eventId: eventId },
      disableClose: true,
      width: '70%',
    });
  }

  editEvent(eventId: any) {
    this.selectedEventId = eventId;
    const modal = this.dialog.open(EditEventComponent, {
      data: { event_id: this.selectedEventId },
      disableClose: true,
      width: '70%',
      height: '90%',
    });
    modal.afterClosed().subscribe((response) => {
      this.loadEvent();
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
