import { Component, OnInit, OnDestroy } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthserviceService } from '../../../../../core/service/authservice.service';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CardModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit, OnDestroy {
  totalUser: any[] = [];
  userCount: number = 0;
  totalEvents: any[] = [];
  eventCount: number = 0;
  totalRegisteredUser: number = 0;
  private refreshSubscription: Subscription | undefined;

  constructor(
    private service: AuthserviceService,
    private data: DataAnalyticsService
  ) {}

  ngOnInit(): void {
    this.setupPolling();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private setupPolling() {
    this.refreshSubscription = timer(0, 60000)
      .pipe(
        switchMap(() => {
          return this.service.getUsers();
        }),
        switchMap((res: any) => {
          this.totalUser = res.payload;
          this.userCount = this.totalUser.length;
          return this.service.getAllEvents();
        }),
        switchMap((res: any) => {
          this.totalEvents = res.payload;
          this.eventCount = this.totalEvents.length;
          return this.data.getAllRegisteredUser();
        })
      )
      .subscribe(
        (res: any) => {
          this.totalRegisteredUser = res.payload;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
}
