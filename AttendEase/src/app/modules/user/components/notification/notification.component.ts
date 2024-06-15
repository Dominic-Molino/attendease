import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  userId: any;
  notification: any[] = [];
  private subscription?: Subscription;

  constructor(private service: AuthserviceService) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.loadNotification();
    this.setupPeriodicRefresh();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  loadNotification() {
    this.service.getRegisteredEvents(this.userId).subscribe((res: any) => {
      this.notification = res.payload.map((notif: any) => {
        const currentDate = new Date();
        const eventStartDate = new Date(notif.event_start_date);
        const endDate = new Date(notif.event_end_date);
        notif.eventState = '';

        if (endDate < currentDate) {
          notif.eventState = 'done';
        } else if (eventStartDate <= currentDate) {
          notif.eventState = 'ongoing';
        } else {
          notif.eventState = 'upcoming';
        }
        return notif;
      });
      this.notification.filter((notif) => notif.eventState === 'done');
    });
  }

  setupPeriodicRefresh() {
    this.subscription = this.service
      .fetchRegisteredEventsPeriodically(this.userId)
      .subscribe((res: any) => {
        this.notification = res.payload;
      });
  }
}
