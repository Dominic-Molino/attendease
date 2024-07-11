import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartOptions, TooltipItem } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';
import { TooltipComponent } from './component/tooltip/tooltip.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ChartModule, MatTooltipModule, TooltipComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  currId: any;
  report: any[] = [];
  pastEvents: any[] = [];
  reportDetail: any;
  chartOptions: ChartOptions | undefined;
  chartDataCache: Map<string, any> = new Map();
  selectedPastEventReport: any;
  selectedEvent: any;
  dropdownOpen: boolean = false;
  activeDropdownOpen: boolean = false;
  pastDropdownOpen: boolean = false;
  tooltipVisible: { [key: string]: boolean } = {};

  constructor(private service: DataAnalyticsService, private router: Router) {}

  ngOnInit(): void {
    this.loadDoneEvents();
    this.loadOngoingReport();
    this.initializeChartOptions();
  }

  loadDoneEvents() {
    this.service.getDoneEvents().subscribe((res) => {
      this.pastEvents = res.payload.slice(0, 5);
      console.log(this.pastEvents);
      if (res.payload.length > 5) {
        this.pastEvents.push({ viewAll: true });
      }
      if (this.pastEvents.length > 0) {
        this.reportDetail = this.pastEvents[0];
      }
    });
  }

  loadOngoingReport() {
    this.service.getOngoingEvents().subscribe((res) => {
      this.report = res.payload;
      if (this.report.length > 0) {
        this.selectedEvent = this.report[0];
      }
    });
  }

  loadReportforDoneEvent(event_id: any) {
    this.service.getAnalytics(event_id).subscribe((res) => {
      this.selectedPastEventReport = res.payload[0];
      console.log(this.selectedPastEventReport);
    });
  }

  toggleTooltip(eventId: string) {
    this.tooltipVisible[eventId] = !this.tooltipVisible[eventId];
    for (const key in this.tooltipVisible) {
      if (key !== eventId) {
        this.tooltipVisible[key] = false;
      }
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.activeDropdownOpen = false;
    this.pastDropdownOpen = false;
  }

  toggleActiveDropdown() {
    this.activeDropdownOpen = !this.activeDropdownOpen;
    this.pastDropdownOpen = false;
  }

  togglePastDropdown() {
    this.pastDropdownOpen = !this.pastDropdownOpen;
    this.activeDropdownOpen = false;
  }

  selectEvent(event: any) {
    this.selectedEvent = event;
    if (!this.isEventPast(event)) {
      this.selectedPastEventReport = null;
    } else {
      this.loadReportforDoneEvent(event.event_id);
    }
    this.toggleDropdown();
  }

  selectEventType(eventType: string) {
    if (eventType === 'active') {
      this.report = this.report;
    } else if (eventType === 'past') {
      this.report = this.pastEvents;
    }
    if (this.report.length > 0) {
      this.selectedEvent = this.report[0];
    }
    this.toggleDropdown();
  }

  isEventPast(event: any): boolean {
    return this.pastEvents.some(
      (pastEvent) => pastEvent.event_id === event.event_id
    );
  }

  //chart
  initializeChartOptions() {
    this.chartOptions = {
      layout: {},
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          display: true,
          labels: {
            color: '#333',
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'pie'>) => {
              const label = context.label || '';
              const value = (context.raw as number) || 0;
              return `${label} : ${value} `;
            },
          },
        },
      },
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
    };
  }

  getChartData(event: any, type: string): any {
    const cacheKey = `${event.event_id}_${type}`;
    if (this.chartDataCache.has(cacheKey)) {
      return this.chartDataCache.get(cacheKey);
    }

    let labels: string[] = [];
    let data: number[] = [];
    let backgroundColor: string[] = [];
    let message = '';

    switch (type) {
      case 'registrationToMaxAttendees':
        labels = ['Registered Users', 'Max Attendees'];
        data = [event.registered_users, event.max_attendees];
        backgroundColor = ['#73300a', '#c75519'];
        const registeredUsersText =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersText} registered.`;
        break;

      case 'courseRegistration':
        const coursesData = event.registered_by_course.map(
          (item: { count: number }) => item.count
        );
        const coursesDataLabel = event.registered_by_course.map(
          (item: { course: string }) => `Course: ${item.course}`
        );
        labels = [...coursesDataLabel];
        data = [...coursesData];
        backgroundColor = [
          '#73300a',
          '#c75519',
          '#ff8a00',
          '#f6aa54',
          '#3e2723',
          '#5d4037',
          '#795548',
          '#8d6e63',
        ];
        const courses = event.registered_by_course
          .map(
            (item: { course: string; count: number }) =>
              `<li>${item.course}: ${item.count} ${
                item.count === 1 ? 'student' : 'students'
              }</li>`
          )
          .join('');
        const registeredUsersTextCourse =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextCourse} registered.<br><br> Registered by courses:<ul>${courses}</ul>`;
        break;

      case 'yearLevelRegistration':
        const yearLevelsData = event.registered_by_year_level.map(
          (item: { count: number }) => item.count
        );
        const yearLevelsDataLabel = event.registered_by_year_level.map(
          (item: { year_level: string }) => `Year Level: ${item.year_level}`
        );
        labels = [...yearLevelsDataLabel];
        data = [...yearLevelsData];
        backgroundColor = [
          '#73300a',
          '#c75519',
          '#ff8a00',
          '#f6aa54',
          '#3e2723',
          '#5d4037',
          '#795548',
          '#8d6e63',
        ];
        const yearLevels = event.registered_by_year_level
          .map(
            (item: { year_level: string; count: number }) =>
              `<li>${item.year_level}: ${item.count} ${
                item.count === 1 ? 'student' : 'students'
              }</li>`
          )
          .join('');
        const registeredUsersTextYear =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextYear} registered.<br><br> Registered by year levels:<ul>${yearLevels}</ul>`;
        break;
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          label:
            type === 'registrationToMaxAttendees'
              ? 'Attendees'
              : type === 'courseRegistration'
              ? 'Course Registrations'
              : 'Year Level Registrations',
          data: data,
          backgroundColor: backgroundColor,
        },
      ],
      message: message,
    };

    this.chartDataCache.set(cacheKey, chartData);
    return chartData;
  }

  getReportChart(event: any) {
    if (this.chartDataCache.has(event.event_id)) {
      return this.chartDataCache.get(event.event_id);
    }

    const chartData = {
      labels: ['Present Students', 'No. of Registered Students'],
      datasets: [
        {
          label: 'Present Participants',
          backgroundColor: ['#c75519', '#ff8a00'],
          data: [event.present_count, event.registered_users],
        },
      ],
    };

    this.chartDataCache.set(event.event_id, chartData);
    return chartData;
  }

  isDataAvailable(event: any): boolean {
    return (
      event.registered_users > 0 ||
      (event.registered_by_course && event.registered_by_course.length > 0) ||
      (event.registered_by_year_level &&
        event.registered_by_year_level.length > 0)
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedOutside =
      !target.closest('.tooltip-content') && !target.closest('svg');

    if (clickedOutside) {
      for (const key in this.tooltipVisible) {
        this.tooltipVisible[key] = false;
      }
    }
  }

  viewAll() {
    this.router.navigate(['admin/admin-past-event']);
  }
}
