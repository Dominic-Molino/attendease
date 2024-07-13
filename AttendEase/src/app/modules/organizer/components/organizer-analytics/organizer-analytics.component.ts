import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { ChartOptions, TooltipItem, Chart, Title } from 'chart.js';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MatTooltipModule } from '@angular/material/tooltip';
import 'chartjs-adapter-date-fns';
import { ActivitylogsComponent } from '../../../../shared/components/activitylogs/activitylogs.component';
import { OrganizerCalendarComponent } from './component/organizer-calendar/organizer-calendar.component';
import { OngoingReportComponent } from './component/ongoing-report/ongoing-report.component';

@Component({
  selector: 'app-organizer-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    MatTooltipModule,
    ActivitylogsComponent,
    OrganizerCalendarComponent,
    OngoingReportComponent,
  ],
  templateUrl: './organizer-analytics.component.html',
  styleUrl: './organizer-analytics.component.css',
})
export class OrganizerAnalyticsComponent {
  currId: any;
  events: any[] = [];
  report: any[] = [];
  user: any[] = [];
  selectedEvent: any;
  dropdownOpen: boolean = false;
  lineChartData: any;
  lineChartOptions: ChartOptions | undefined;

  constructor(private service: EventService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadReport(this.currId);
    this.loadAllEvent(this.currId);
    this.initializeChartOptions();
  }

  loadReport(id: any) {
    this.service.getUpcomingReport(id).subscribe((res) => {
      console.log(res.payload);
      this.report = res.payload;
      if (this.report.length > 0) {
        this.selectedEvent = this.report[0];
        this.prepareLineChartData(this.selectedEvent);
      }
    });
  }

  loadAllEvent(id: any) {
    this.service.getApprovedOrganizerEvents(id).subscribe((res) => {
      this.events = res.payload;
      console.log(`EVENT LIST:${this.events}`);

      if (this.events.length > 0) {
        this.events.forEach((event) => {
          this.getRegisteredUser(event.event_id, event);
        });
      }
    });
  }

  getRegisteredUser(id: any, event: any) {
    this.service.getRegisteredUser(id).subscribe((res) => {
      event.registered_users_data = res.payload;
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
