import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { EventService } from '../../../../core/service/event.service';
import { ChartOptions, TooltipItem } from 'chart.js';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ongoingreport',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './ongoingreport.component.html',
  styleUrl: './ongoingreport.component.css',
})
export class OngoingreportComponent implements OnInit {
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

  constructor(private service: EventService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.initializeChartOptions();
    this.loadOngoingReport(this.currId);
    this.loadDoneEvents(this.currId);
  }

  loadOngoingReport(id: any) {
    this.service.getOngoingReport(id).subscribe((res) => {
      this.report = res.payload;
      console.log(this.report);
      if (this.report.length > 0) {
        this.selectedEvent = this.report[0];
      }
    });
  }

  loadDoneEvents(id: any) {
    this.service.getDoneEventsOfOrg(id).subscribe((res) => {
      this.pastEvents = res.payload;
      if (this.pastEvents.length > 0) {
        this.reportDetail = this.pastEvents[0];
      }
      console.log('Past Events:', this.pastEvents);
      console.log('Report Detail:', this.reportDetail);
    });
  }

  loadReportforDoneEvent(event_id: any) {
    this.service.getReport(event_id).subscribe((res) => {
      this.selectedPastEventReport = res.payload[0];
      console.log(`Load Report for Done Event:`, this.selectedPastEventReport);
    });
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
    if (this.isEventPast(event)) {
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
    this.toggleDropdown(); // Close dropdown after selecting event type
  }

  isEventPast(event: any): boolean {
    // Determine if the event is in the past events list
    return this.pastEvents.some(
      (pastEvent) => pastEvent.event_id === event.event_id
    );
  }

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
            label: (context: TooltipItem<'bar'>) => {
              // Specify the type for context
              const label = context.label || '';
              const value = (context.raw as number) || 0;
              return `${label} : ${value} `;
            },
          },
        },
      },

      elements: {
        arc: {
          borderWidth: 0, // Remove border for a cleaner look
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
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} have registered.`;
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
              `${item.count} in ${item.course}`
          )
          .join(', ');
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} have registered. Courses: ${courses}.`;
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
              `${item.count} in ${item.year_level}`
          )
          .join(', ');
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} have registered. Year Levels: ${yearLevels}.`;
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

  getRegistrationMessage(event: any): string {
    return `Out of ${event.max_attendees} potential attendees, ${event.registered_users}  have registered.`;
  }

  isDataAvailable(event: any): boolean {
    return (
      event.registered_users > 0 ||
      (event.registered_by_course && event.registered_by_course.length > 0) ||
      (event.registered_by_year_level &&
        event.registered_by_year_level.length > 0)
    );
  }

  trackByEventId(index: number, event: any): number {
    return event.event_id;
  }
}
