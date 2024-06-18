import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../../../../../core/service/event.service';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit, OnDestroy {
  data: any = {}; // Initially empty
  options: any;
  private refreshSubscription: Subscription | undefined;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.setupPolling();

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14,
              family: 'Inter',
            },
          },
        },
        title: {
          display: true,
          text: 'Event Status Overview',
          font: {
            size: 18,
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Number of Events',
            font: {
              family: 'Inter',
              size: 14,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Event Status',
            font: {
              family: 'Inter',
              size: 14,
            },
          },
          ticks: {
            beginAtZero: true,
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
    this.refreshSubscription = timer(0, 30000)
      .pipe(switchMap(() => this.eventService.getAllEvents()))
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

          // Update the chart data
          this.data = {
            labels: ['Ongoing', 'Done', 'Upcoming'],
            datasets: [
              {
                label: 'Events',
                backgroundColor: '#04c464',
                barThickness: 20,
                borderRadius: 15,
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
