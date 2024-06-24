import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService } from '../../../../core/service/event.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, of, switchMap } from 'rxjs';
import { Event } from '../../../../interfaces/EventInterface';

@Component({
  selector: 'app-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgxPaginationModule, MatTooltipModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit, OnDestroy {
  latestEvent: Event | undefined;
  @Output() viewEventClicked = new EventEmitter();

  eventList: Event[] = [];
  filteredEventList: any[] = [];

  loading: boolean = false;
  maxChar: number = 100;

  p: number = 1;
  itemsPerPage: number = 6;

  private updateSubscription?: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  fetchEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (result: any) => {
        if (result && Array.isArray(result)) {
          this.eventList = result.map((event) => ({
            ...event,

            event_start_date: new Date(event.event_start_date),
            event_end_date: new Date(event.event_end_date),
            event_registration_start: new Date(event.event_registration_start),
            event_registration_end: new Date(event.event_registration_end),
            categories: JSON.parse(event.categories),
            event_image$: this.eventService.getEventImage(event.event_id).pipe(
              switchMap((imageResult) => {
                if (imageResult.size > 0) {
                  const url = URL.createObjectURL(imageResult);
                  return of(this.sanitizer.bypassSecurityTrustResourceUrl(url));
                } else {
                  return of(undefined);
                }
              })
            ),
          }));

          this.eventList = this.eventList.filter(
            (event) => event.status !== 'done'
          );

          this.latestEvent =
            this.eventList.length > 0 ? this.eventList[0] : undefined;

          this.p = 1;

          this.filteredEventList = this.eventList.filter(
            (event) => event !== this.latestEvent
          );
        } else {
          console.error('Expected an array but got:', result);
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.loading = false;
      },
    });
  }

  openPreview(eventId: number) {
    let routePrefix = '/student/preview';
    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }

  truncateDescription(text: string, maxLength: number): string {
    return text && text.length > maxLength
      ? `${text.substring(0, maxLength)} ...`
      : text;
  }
}
