import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { Event } from '../../../interfaces/EventInterface';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { formatDistanceToNow, isBefore } from 'date-fns';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  standalone: true,
  imports: [MatTabsModule, CommonModule],
  selector: 'app-monitored-event',
  templateUrl: './monitored-event.component.html',
  styleUrls: ['./monitored-event.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MonitoredEventComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  selectedEvent: Event | null = null;
  registeredUsersMap: { [eventId: number]: any[] } = {};
  groupedRegisteredUsersMap: { [eventId: number]: { [date: string]: any[] } } =
    {};
  currentIndex: number = 0;
  currId: any;
  isDrawerVisible: boolean = false;

  private pollingInterval = 5000; // Polling interval in milliseconds
  private pollingSubscription: Subscription | undefined;
  private lastFetchedEvents: Event[] = [];

  constructor(
    private eventService: EventService,
    private authService: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.currId = this.authService.getCurrentUserId();
    this.startPolling();
    this.loadData(this.currId);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        switchMap(() =>
          this.eventService.getApprovedOrganizerEvents(this.currId)
        )
      )
      .subscribe((res: any) => {
        const updatedEvents: Event[] = res.payload;

        // Update events only if they have changed since last fetch
        if (!this.areEventsEqual(this.lastFetchedEvents, updatedEvents)) {
          this.events = updatedEvents;
          this.lastFetchedEvents = [...updatedEvents];

          // Update selected event if it has changed
          if (
            !this.selectedEvent ||
            !this.events.some(
              (e) => e.event_id === this.selectedEvent!.event_id
            )
          ) {
            this.selectedEvent = this.events[this.currentIndex] || null;
          }

          // Reload registered users for the selected event
          if (this.selectedEvent) {
            this.loadRegisteredUsers(this.selectedEvent.event_id);
          }
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadData(id: any) {
    if (id) {
      this.eventService.getApprovedOrganizerEvents(id).subscribe((res: any) => {
        this.events = res.payload;
        this.lastFetchedEvents = [...this.events]; // Initialize last fetched events

        if (this.events.length > 0) {
          this.selectedEvent = this.events[this.currentIndex];
          this.loadRegisteredUsers(this.selectedEvent.event_id);
        }
      });
    }
  }

  loadRegisteredUsers(eventId: number): void {
    this.eventService.getRegisteredUser(eventId).subscribe((res: any) => {
      this.registeredUsersMap[eventId] = res.payload || [];
      this.groupRegisteredUsersByDate(eventId);
    });
  }

  groupRegisteredUsersByDate(eventId: number): void {
    const users = this.registeredUsersMap[eventId] || [];
    this.groupedRegisteredUsersMap[eventId] = users.reduce(
      (acc: any, user: any) => {
        const date = new Date(user.registration_date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(user);
        return acc;
      },
      {}
    );
  }

  getDates(eventId: number): string[] {
    return Object.keys(this.groupedRegisteredUsersMap[eventId] || {});
  }

  prevEvent(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedEvent = this.events[this.currentIndex];
      this.loadRegisteredUsers(this.selectedEvent.event_id);
    }
  }

  nextEvent(): void {
    if (this.currentIndex < this.events.length - 1) {
      this.currentIndex++;
      this.selectedEvent = this.events[this.currentIndex];
      this.loadRegisteredUsers(this.selectedEvent.event_id);
    }
  }

  formatRegistrationDate(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  isNewUser(user: any): boolean {
    // Example: Check if the registration date is within the last minute
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    return isBefore(new Date(user.registration_date), oneMinuteAgo);
  }

  toggleDrawer(): void {
    this.isDrawerVisible = !this.isDrawerVisible;
  }

  closeDrawer(): void {
    this.isDrawerVisible = false;
  }

  private areEventsEqual(events1: Event[], events2: Event[]): boolean {
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
