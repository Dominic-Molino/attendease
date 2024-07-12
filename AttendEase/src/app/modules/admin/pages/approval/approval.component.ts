import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';

@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './approval.component.html',
  styleUrl: './approval.component.css',
})
export class ApprovalComponent implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];
  loading: boolean = false;

  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  private pollingInterval = 10000;
  private pollingSubscription: Subscription | undefined;

  constructor(private evService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(switchMap(() => this.evService.getEvents()))
      .subscribe((res: any) => {
        const updatedEvents = res.payload;

        if (!this.areEventsEqual(this.events, updatedEvents)) {
          this.events = updatedEvents;
          this.filteredEvents = [...this.events];
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadEvents() {
    this.evService.getEvents().subscribe((res: any) => {
      this.events = res.payload;
      console.log(this.events);
      this.filteredEvents = [...this.events];
    });
  }

  openPage(eventId: any) {
    this.router.navigate([`/admin/admin-approval/${eventId}`]);
  }

  searchEvents(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (!searchTerm) {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(
        (event) =>
          event.event_name.toLowerCase().includes(searchTerm) ||
          event.organizer_name.toLowerCase().includes(searchTerm) ||
          event.organizer_organization.toLowerCase().includes(searchTerm) ||
          event.approval_status.toLowerCase().includes(searchTerm)
      );
    }
  }

  private areEventsEqual(events1: any[], events2: any[]): boolean {
    if (events1.length !== events2.length) {
      return false;
    }
    for (let i = 0; i < events1.length; i++) {
      if (events1[i].event_id !== events2[i].event_id) {
        return false;
      }
    }
    return true;
  }
}
