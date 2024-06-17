import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { PreviewComponent } from '../../components/preview/preview.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService } from '../../../../core/service/event.service';
import {
  Observable,
  of,
  Subscription,
  interval,
  switchMap,
  catchError,
  finalize,
  timer,
} from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

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
  event_image$: Observable<SafeResourceUrl | undefined>;
}

@Component({
  selector: 'app-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, NgxPaginationModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit, OnDestroy {
  eventList: Event[] = [];
  filteredEventList: any[] = [];
  latestEvent: any;

  loading: boolean = false;
  maxChar: number = 100;

  p: number = 1;
  itemsPerPage: number = 6;

  private updateSubscription?: Subscription;

  constructor(
    private dialog: MatDialog,
    private service: AuthserviceService,
    private sanitizer: DomSanitizer,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  fetchEvents(): void {
    this.loading = true;
    this.service
      .getAllEvents()
      .pipe(
        catchError((error) => {
          const errorMessage =
            error.error?.status?.message || 'An error occurred';
          Swal.fire('', errorMessage, 'warning');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((result: any) => {
        if (result) {
          this.eventList = result.payload.map((data: any): Event => {
            const categories: string[] = JSON.parse(data.categories);
            return {
              event_id: data.event_id,
              event_name: data.event_name,
              event_description: data.event_description,
              event_location: data.event_location,
              event_start_date: new Date(data.event_start_date),
              event_end_date: new Date(data.event_end_date),
              event_registration_start: new Date(data.event_registration_start),
              event_registration_end: new Date(data.event_registration_end),
              session: data.session,
              max_attendees: data.max_attendees,
              categories: categories,
              organizer_name: data.organizer_name.replace(/^"|"$/g, ''),
              event_image$: this.eventService.getEventImage(data.event_id).pipe(
                switchMap((imageResult) => {
                  if (imageResult.size > 0) {
                    const url = URL.createObjectURL(imageResult);
                    return of(
                      this.sanitizer.bypassSecurityTrustResourceUrl(url)
                    );
                  } else {
                    return of(undefined);
                  }
                })
              ),
            };
          });

          this.eventList.sort(
            (a, b) =>
              b.event_start_date.getTime() - a.event_start_date.getTime()
          );

          this.latestEvent =
            this.eventList.length > 0 ? this.eventList[0] : undefined;

          this.p = 1;

          this.filteredEventList = this.eventList.filter(
            (event) => event !== this.latestEvent
          );
        }
      });
  }

  startPolling(): void {
    this.updateSubscription = timer(3000, 30000) // Poll every 30 seconds
      .pipe(switchMap(() => this.service.getAllEvents()))
      .subscribe(
        (result) => {
          this.fetchEvents();
        },
        (error) => {
          const errorMessage =
            error.error?.status?.message || 'An error occurred';
          Swal.fire('', errorMessage, 'warning');
        }
      );
  }

  viewEvent(event: any) {
    this.dialog.open(PreviewComponent, {
      data: { event },
      panelClass: 'dialog-container',
      disableClose: true,
      width: '70%',
      height: '90%',
    });
  }

  truncateDescription(text: string, maxLength: number): string {
    return text && text.length > maxLength
      ? `${text.substring(0, maxLength)} ...`
      : text;
  }
}
