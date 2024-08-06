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
import { Subscription, catchError, interval, map, of, switchMap } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdateimageComponent } from '../../components/updateimage/updateimage.component';
import { MobicalendarComponent } from '../../../user/components/mobicalendar/mobicalendar.component';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Event } from '../../../../interfaces/EventInterface';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';
import { formatDistanceToNow } from 'date-fns';
import { MessagepopComponent } from '../../components/messagepop/messagepop.component';
import { EventCancellationComponent } from '../../components/event-cancellation/event-cancellation.component';

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
    CarouselModule,
  ],
})
export class OrgEventComponent implements OnInit {
  eventList: Event[] = [];
  maxChar = 100;
  selectedEventId: any;
  isDropdownOpen: boolean = false;
  currId: any;
  registeredUsers: any;

  filteredEventList: { [key: string]: Event[] } = {
    Approved: [],
    Rejected: [],
    Pending: [],
  };
  currentFilter: string = 'Approved';

  // Pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  responsiveOptions: any[] | undefined;
  maxSize = 5;

  constructor(
    private service: EventService,
    private user: AuthserviceService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.currId = this.user.getCurrentUserId();
    console.log(this.currId);
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.loadEvent();

    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  loadEvent() {
    this.service.getAllOrganizerEvents(this.currId).subscribe(
      (response: any) => {
        this.eventList = response.payload.map((event: any) => {
          if (event.target_participants) {
            event.target_participants = JSON.parse(event.target_participants);
          }
          return event;
        });

        this.filterEventsByApprovalStatus();
        this.p = 1;
        console.log(this.eventList);
      },
      (error: any) => {
        console.error('Error loading events:', error);
      }
    );
  }

  filterEventsByApprovalStatus() {
    this.filteredEventList['Approved'] = this.sortEventsByState(
      this.eventList.filter((event) => event.approval_status === 'Approved')
    );
    this.filteredEventList['Rejected'] = this.eventList.filter(
      (event) => event.approval_status === 'Rejected'
    );
    this.filteredEventList['Pending'] = this.eventList.filter(
      (event) => event.approval_status === 'Pending'
    );
  }

  sortEventsByState(events: Event[]): Event[] {
    return events.sort((a, b) => {
      const stateOrder = ['done', 'ongoing', 'upcoming'];
      const stateA = this.getEventState(a);
      const stateB = this.getEventState(b);
      return stateOrder.indexOf(stateA) - stateOrder.indexOf(stateB);
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getRegisteredUser(eventId: number) {
    this.service.getRegisteredUser(eventId).subscribe((res) => {
      this.registeredUsers = res.payload;
    });
  }

  getFormattedTargetParticipants(participants: any[]): string {
    if (!Array.isArray(participants)) {
      console.error('Invalid participants data:', participants);
      return '';
    }

    const groupedParticipants: { [key: string]: string[] } = {};

    participants.forEach((participant) => {
      if (!groupedParticipants[participant.department]) {
        groupedParticipants[participant.department] = [];
      }
      groupedParticipants[participant.department].push(participant.year_levels);
    });

    return Object.keys(groupedParticipants)
      .map((department) => {
        const years = groupedParticipants[department].join(', ');
        return `${department} - ${years}`;
      })
      .join(' | ');
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

  previewEvent(eventId: any) {
    let routePrefix = 'organizer/events-preview';
    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }

  truncateDescription(text: string, maxLength: number): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }

  openMessage(message: any, approved_at: any, name: any) {
    this.dialog.open(MessagepopComponent, {
      data: { message: message, date: approved_at, name: name },
      disableClose: true,
      width: '35%',
    });
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

  formatRegistrationDate(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  deleteEvent(eventId: any) {
    if (eventId) {
      Swal.fire({
        title: 'Are you sure you want to delete this event?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.service.deleteEvent(eventId).subscribe(
            (res) => {
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
                title: 'Event has been deleted.',
              });
              this.loadEvent();
            },
            (error) => {
              Swal.fire({
                title: 'Error!',
                text: 'Failed to delete event.',
                icon: 'error',
              });
            }
          );
        }
      });
    }
  }

  cancelEvent(event_id: any) {
    console.log(event_id);
    const page = this.dialog.open(EventCancellationComponent, {
      data: { id: event_id },
      width: '40%',
      disableClose: true,
    });

    page.afterClosed().subscribe((res) => {
      this.loadEvent();
    });
  }
}
