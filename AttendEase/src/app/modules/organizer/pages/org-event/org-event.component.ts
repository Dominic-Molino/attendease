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
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdateimageComponent } from '../../components/updateimage/updateimage.component';
import { MobicalendarComponent } from '../../../../shared/components/mobicalendar/mobicalendar.component';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Event } from '../../../../interfaces/EventInterface';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OrganizerCalendarComponent } from '../../../../shared/components/organizer-calendar/organizer-calendar.component';

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
    NgxPaginationModule,
    MobicalendarComponent,
    MatTooltipModule,
    MatTabsModule,
    MatPaginatorModule,
    OrganizerCalendarComponent,
  ],
})
export class OrgEventComponent implements OnInit, OnDestroy {
  eventList: Event[] = [];
  maxChar = 100;
  selectedEventId: any;
  isDropdownOpen: boolean = false;

  filteredEventList: { [key: string]: Event[] } = {
    Approved: [],
    Rejected: [],
    Pending: [],
  };

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
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadEvent() {
    this.service.getEvents().subscribe(
      (response: any) => {
        this.eventList = response.payload;
        console.log(this.eventList);
        this.filterEventsByApprovalStatus();
        this.p = 1;
      },
      (error: any) => {
        console.error('Error loading events:', error);
      }
    );
  }

  filterEventsByApprovalStatus() {
    this.filteredEventList['Approved'] = this.eventList.filter(
      (event) => event.approval_status === 'Approved'
    );
    console.log(this.filteredEventList['Approved']);
    this.filteredEventList['Rejected'] = this.eventList.filter(
      (event) => event.approval_status === 'Rejected'
    );
    console.log(this.filteredEventList['Rejected']);
    this.filteredEventList['Pending'] = this.eventList.filter(
      (event) => event.approval_status === 'Pending'
    );
    console.log(this.filteredEventList['Pending']);
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

  getEventState(event: any): string {
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
