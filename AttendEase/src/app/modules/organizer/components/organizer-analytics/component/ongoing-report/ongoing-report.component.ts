import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChartOptions, TooltipItem } from 'chart.js';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventService } from '../../../../../../core/service/event.service';

@Component({
  selector: 'app-ongoing-report',
  standalone: true,
  imports: [CommonModule, ChartModule, MatTooltipModule],
  templateUrl: './ongoing-report.component.html',
  styleUrl: './ongoing-report.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class OngoingReportComponent implements OnInit {
  currId: any;
  report: any[] = [];
  chartOptions: any;
  chartDataCache: Map<string, any> = new Map();
  selectedEvent: any;
  dropdownOpen: boolean = false;
  openDetails: boolean = false;

  constructor(private service: EventService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.initializeChartOptions();
    this.loadOngoingReport(this.currId);
  }

  loadOngoingReport(id: any) {
    this.service.getOngoingReport(id).subscribe((res) => {
      this.report = res.payload;
      if (this.report.length > 0) {
        this.selectedEvent = this.report[0];
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleOpenDetails() {
    this.openDetails = !this.openDetails;
  }

  selectEvent(event: any) {
    this.selectedEvent = event;
    this.updateCharts();
  }

  updateCharts() {
    this.chartOptions = { ...this.chartOptions };
  }

  initializeChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      radius: 50,
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
        labels = ['Active Users', 'Max Attendees'];
        data = [event.registered_users, event.max_attendees];
        backgroundColor = ['#73300a', '#c75519'];
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} have registered.`;
        break;

      case 'courseRegistration':
        if (event.registered_by_course) {
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
        }

        break;

      case 'yearLevelRegistration':
        if (event.registered_by_year_level) {
          const yearLevelsData = event.registered_by_year_level.map(
            (item: { count: number }) => item.count
          );
          const yearLevelsDataLabel = event.registered_by_year_level.map(
            (item: { year_level: string }) => `${item.year_level}`
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
        }
        break;

      case 'blockRegistration':
        if (event.registered_by_block) {
          const blocksData = event.registered_by_block.map(
            (item: { count: number }) => item.count
          );
          const blocksDataLabel = event.registered_by_block.map(
            (item: { block: string }) => `Block: ${item.block}`
          );
          labels = [...blocksDataLabel];
          data = [...blocksData];
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
          const blocks = event.registered_by_block
            .map(
              (item: { block: string; count: number }) =>
                `${item.count} in ${item.block}`
            )
            .join(', ');
          message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} have registered. blocks: ${blocks}.`;
        }
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
              : type === 'yearLevelRegistration'
              ? 'Year Level Registrations'
              : 'blockRegistration',
          data: data,
          backgroundColor: backgroundColor,
        },
      ],
      message: message,
    };

    this.chartDataCache.set(cacheKey, chartData);
    return chartData;
  }

  replaceString(event: string) {
    return event.replace(' Year', ' ');
  }

  getRegistrationMessage(event: any): string {
    return `Out of ${event.max_attendees} potential attendees, ${event.registered_users}  have registered.`;
  }
}
