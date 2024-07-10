import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthserviceService } from '../../../../../core/service/authservice.service';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartModule } from 'primeng/chart';
import { TooltipItem } from 'chart.js';
import { EventService } from '../../../../../core/service/event.service';
import { CommonModule } from '@angular/common';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_start_date: string;
  event_end_date: string;
  event_registration_start: string;
  event_registration_end: string;
  session: string;
  max_attendees: number | null;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [MatTooltipModule, ChartModule, CommonModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit, OnDestroy {
  totalUser: any[] = [];
  userCount: number = 0;
  totalEvents: any[] = [];
  eventCount: number = 0;
  totalRegisteredUser: number = 0;
  showAttendance: boolean = false;
  showTooltip: boolean = false;
  datas: any = {};
  options: any;
  private refreshSubscription: Subscription | undefined;

  constructor(
    private service: AuthserviceService,
    private eventService: EventService,
    private data: DataAnalyticsService
  ) {}

  ngOnInit(): void {
    this.setupPolling();
    this.setupPolling2();

    this.options = {
      plugins: {
        legend: {
          title: {
            position: 'top',
            display: true,
            text: 'Event Status',
            padding: {
              top: 10,
            },
            font: {
              family: 'Inter',
              size: 14,
            },
          },
          position: 'right',
          labels: {
            color: '#333',
            usePointStyle: true,
          },
        },

        tooltip: {
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'bar'>) => {
              // Specify the type for context
              const label = context.label || '';
              const value = (context.raw as number) || 0;
              return `${label} Events - ${value} `;
            },
          },
        },
      },
    };
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

  private setupPolling2() {
    this.refreshSubscription = timer(0, 60000)
      .pipe(switchMap(() => this.eventService.getEvents()))
      .subscribe(
        (res: any) => {
          const events: Event[] = res.payload;

          const currentDate = new Date();

          let ongoing = 0,
            done = 0,
            upcoming = 0;

          events.forEach((event: Event) => {
            const startDate = new Date(event.event_start_date);
            const endDate = new Date(event.event_end_date);

            if (endDate < currentDate) {
              done++;
            } else if (startDate > currentDate) {
              upcoming++;
            } else {
              ongoing++;
            }
          });

          this.datas = {
            labels: ['Ongoing', 'Done', 'Upcoming'],
            datasets: [
              {
                label: 'Events',
                backgroundColor: ['#ff8a00', '#f6aa54', '#c75519'],
                data: [ongoing, done, upcoming],
              },
            ],
          };
        },
        (error) => {
          console.error('Error fetching events data:', error);
        }
      );
  }
}
