import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
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
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdateimageComponent } from '../../components/updateimage/updateimage.component';
import { MobicalendarComponent } from '../../../../shared/components/mobicalendar/mobicalendar.component';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_start_date: Date;
  event_end_date: Date;
  event_registration_start: Date;
  event_registration_end: Date;
  event_type: string;
  max_attendees: number;
  categories: string[];
  organizer_name: string;
  event_image: SafeResourceUrl | undefined;
  event_image$?: Observable<SafeResourceUrl>;
  approval_status: 'Approved' | 'Rejected' | 'Pending'; // Update as per your backend enum
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
    MobicalendarComponent,
    MatTooltipModule,
    MatTabsModule,
  ],
})
export class OrgEventComponent implements OnInit, OnDestroy {
  eventList: Event[] = [];
  maxChar = 100;
  selectedEventId: any;
  isDropdownOpen: boolean = false;

  filteredEventList: { [key: string]: Event[] } = {}; // Corrected structure

  currentFilter: string = 'Approved';

  //pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  private refreshSubscription: Subscription | undefined;

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.loadEvent();

    // Setup polling to refresh events every 30 seconds
    this.setupPolling();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  setupPolling() {
    const pollingIntervalMs = 30000; // 30 seconds

    this.refreshSubscription = interval(pollingIntervalMs)
      .pipe(switchMap(() => this.service.getAllEvents()))
      .subscribe(
        (result: any[]) => {
          this.eventList = result.map((data: any) => {
            return {
              event_id: data.event_id,
              event_name: data.event_name,
              event_description: data.event_description,
              event_location: data.event_location,
              event_start_date: new Date(data.event_start_date),
              event_end_date: new Date(data.event_end_date),
              event_registration_start: new Date(data.event_registration_start),
              event_registration_end: new Date(data.event_registration_end),
              event_type: data.event_type,
              max_attendees: data.max_attendees,
              categories: JSON.parse(data.categories),
              organizer_name: data.organizer_name.replace(/^"|"$/g, ''),
              event_image: undefined,
              approval_status: data.approval_status,
              event_image$: undefined,
            };
          });

          console.log(this.eventList);

          this.filteredEventList = {
            Approved: this.eventList.filter(
              (event) => event.approval_status === 'Approved'
            ),
            Rejected: this.eventList.filter(
              (event) => event.approval_status === 'Rejected'
            ),
            Pending: this.eventList.filter(
              (event) => event.approval_status === 'Pending'
            ),
          };

          console.log(this.filteredEventList);
        },
        (error) => {
          console.error('Error fetching event details:', error);
        }
      );
  }

  loadEvent() {
    this.service.getAllEvents().subscribe((result: any[]) => {
      this.eventList = result.map((data: any) => {
        return {
          event_id: data.event_id,
          event_name: data.event_name,
          event_description: data.event_description,
          event_location: data.event_location,
          event_start_date: new Date(data.event_start_date),
          event_end_date: new Date(data.event_end_date),
          event_registration_start: new Date(data.event_registration_start),
          event_registration_end: new Date(data.event_registration_end),
          event_type: data.event_type,
          max_attendees: data.max_attendees,
          categories: JSON.parse(data.categories),
          organizer_name: data.organizer_name.replace(/^"|"$/g, ''),
          event_image: undefined,
          approval_status: data.approval_status,
          event_image$: undefined,
        };
      });

      console.log(this.eventList);

      // Group events by approval approval_status
      this.filteredEventList = {
        Approved: this.eventList.filter(
          (event) => event.approval_status === 'Approved'
        ),
        Rejected: this.eventList.filter(
          (event) => event.approval_status === 'Rejected'
        ),
        Pending: this.eventList.filter(
          (event) => event.approval_status === 'Pending'
        ),
      };

      console.log(this.filteredEventList);
    });
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
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
    if (this.eventList) {
      const modal = this.dialog.open(AddEventComponent, {
        width: '60%',
        height: '90%',
        disableClose: true,
      });

      modal.afterClosed().subscribe((response) => {
        this.loadEvent();
      });
    }
  }

  openFile(eventId: number) {
    this.dialog.open(UpdateimageComponent, {
      data: { eventId: eventId },
      disableClose: true,
      width: '60%',
    });
  }

  editEvent(eventId: any) {
    this.selectedEventId = eventId;
    const modal = this.dialog.open(EditEventComponent, {
      data: { event_id: this.selectedEventId },
      disableClose: true,
      width: '60%',
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

  getEventapproval_status(event: any): string {
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
