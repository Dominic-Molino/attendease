import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivitylogsComponent } from '../../../../shared/components/activitylogs/activitylogs.component';
import { EventListingComponent } from './components/event-listing/event-listing.component';
import { CarouselModule } from 'primeng/carousel';
import { CourseComponent } from './components/course/course.component';
import { YearLevelComponent } from './components/year-level/year-level.component';
import { BlockComponent } from './components/block/block.component';
import { ComparingEventsComponent } from './components/comparing-events/comparing-events.component';
import { OngoingReportComponent } from './components/ongoing-report/ongoing-report.component';
import { DataAnalyticsService } from '../../../../core/service/data-analytics.service';
import { ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { EventService } from '../../../../core/service/event.service';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    ActivitylogsComponent,
    EventListingComponent,
    CarouselModule,
    CourseComponent,
    YearLevelComponent,
    BlockComponent,
    ComparingEventsComponent,
    OngoingReportComponent,
  ],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css',
})
export class AdminAnalyticsComponent implements OnInit {
  slides: string[] = [];
  report: any[] = [];
  selectedEvent: any;
  dropdownOpen: boolean = false;
  lineChartData: any;
  lineChartOptions: ChartOptions | undefined;

  constructor(
    private service: DataAnalyticsService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.slides = ['course', 'year-level', 'block'];
    this.initializeChartOptions();
    this.loadReport();
  }

  loadReport() {
    this.service.getUpcomingEvents().subscribe((res) => {
      console.log(res.payload);
      this.report = res.payload;

      if (this.report.length > 0) {
        this.selectedEvent = this.report[0];
        this.report.forEach((event) => {
          this.getRegisteredUser(event.event_id, event);
        });
        this.prepareLineChartData(this.selectedEvent);
      }
    });
  }

  getRegisteredUser(id: any, event: any) {
    this.eventService.getRegisteredUser(id).subscribe((res) => {
      event.registered_users_data = res.payload;
      console.log(event.registered_users_data);
      if (
        this.selectedEvent &&
        this.selectedEvent.event_id === event.event_id
      ) {
        this.prepareLineChartData(event);
      }
    });
  }

  initializeChartOptions() {
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: '',
          font: {
            size: 16,
          },
        },
        legend: {
          position: 'bottom',
          display: true,
          labels: {
            color: '#ff8a00',
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const date = tooltipItems[0].label;
              return `Date: ${date}`;
            },
            label: (tooltipItem) => {
              const value = tooltipItem.raw;
              return `Registrations: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM d, yyyy',
            displayFormats: {
              day: 'MMM d',
            },
          },
          title: {
            display: true,
            text: 'Registration Date',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: (value) => {
              return Number(value).toFixed(0);
            },
          },
          title: {
            display: true,
            text: 'Registered Students',
          },
        },
      },
    };
  }

  prepareLineChartData(event: any) {
    const dailyRegistrations = event.daily_registrations || [];

    const registrationStartDate: any = new Date(event.event_registration_start)
      .toISOString()
      .split('T')[0];
    if (
      !dailyRegistrations.some(
        (r: { registration_date: string }) =>
          r.registration_date === registrationStartDate
      )
    ) {
      dailyRegistrations.push({
        registration_date: registrationStartDate,
        count: 0,
      });
    }

    // Sort the data by date to ensure correct order
    dailyRegistrations.sort(
      (a: { registration_date: string }, b: { registration_date: string }) =>
        new Date(a.registration_date).getTime() -
        new Date(b.registration_date).getTime()
    );

    const labels = dailyRegistrations.map(
      (r: { registration_date: string }) => r.registration_date
    );
    const data = dailyRegistrations.map((r: { count: number }) => r.count);

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Daily Registrations',
          data: data,
          fill: false,
          borderColor: '#ff8a00',
        },
      ],
    };

    this.lineChartOptions!.scales!['y'] = {
      ...this.lineChartOptions!.scales!['y'],
      max: event.max_attendees + 1,
    };

    this.lineChartOptions!.scales!['x'] = {
      ...this.lineChartOptions!.scales!['x'],
      suggestedMin: registrationStartDate.toString(),
      max: event.event_registration_end,
    };

    this.lineChartOptions!.plugins!.title!.text = `${event.event_name}`;

    this.cdr.detectChanges();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectEvent(event: any) {
    this.selectedEvent = event;
    this.prepareLineChartData(event);
    console.log(event);
    this.toggleDropdown();
  }
}
