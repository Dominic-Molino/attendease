import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { EventService } from '../../../../core/service/event.service';
import { ChartModule } from 'primeng/chart';
import { TooltipItem } from 'chart.js';
import { ChartOptions } from 'chart.js';

interface Event {
  id: number;
  name: string;
}

interface Organizer {
  id: number;
  role_id: number;
  fname: string;
  lname: string;
  organization: string;
  events: Event[];
}

@Component({
  selector: 'app-pastevents',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './pastevents.component.html',
  styleUrl: './pastevents.component.css',
})
export class PasteventsComponent implements OnInit {
  organizers: Organizer[] = [];
  pastEvents: Event[] = [];
  selectedOrganizer: Organizer | null = null;
  showDropdown: boolean = false;
  selectedPastEventReport: any;
  chartOptions: ChartOptions | undefined;
  chartDataCache: Map<string, any> = new Map();

  constructor(
    private service: EventService,
    private user: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.initializeChartOptions();
  }

  loadUser() {
    this.user.getUsers().subscribe(
      (res: any) => {
        if (res && Array.isArray(res.payload)) {
          const filteredUsers = res.payload.filter(
            (user: any) => user.role_id === 2
          );

          this.organizers = filteredUsers.map(
            (user: any): Organizer => ({
              id: user.user_id,
              role_id: user.role_id,
              fname: user.first_name,
              lname: user.last_name,
              organization: user.organization,
              events: [], // Initialize events as an empty array
            })
          );

          this.organizers.forEach((organizer, index) => {
            this.loadEventsDetails(organizer, index === 0);
          });

          if (this.organizers.length > 0) {
            this.selectOrganizer(this.organizers[0]);
          }

          console.log(this.organizers);
        } else {
          console.error('Unexpected response or empty payload:', res);
        }
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  loadEventsDetails(organizer: Organizer, isInitial: boolean = false) {
    this.service.getDoneEventsOfOrg(organizer.id).subscribe(
      (res: { payload: Event[] }) => {
        organizer.events = res.payload.map(
          (event: any): Event => ({
            id: event.event_id,
            name: event.event_name,
          })
        );

        if (
          isInitial &&
          this.selectedOrganizer &&
          this.selectedOrganizer.id === organizer.id
        ) {
          this.pastEvents = organizer.events;
          if (this.pastEvents.length > 0) {
            this.selectEvent(this.pastEvents[0].id);
          }
        }
      },
      (error: any) => {
        console.error(
          `Error fetching events for organizer ${organizer.id}:`,
          error
        );
      }
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownButton = document.querySelector('.dropdown-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (
      dropdownButton &&
      dropdownMenu &&
      !dropdownButton.contains(target) &&
      !dropdownMenu.contains(target)
    ) {
      this.showDropdown = false;
    }
  }
  selectOrganizer(organizer: Organizer) {
    this.selectedOrganizer = organizer;
    this.pastEvents = organizer.events;
    this.showDropdown = false;

    if (this.pastEvents.length > 0) {
      this.selectEvent(this.pastEvents[0].id);
    } else {
      this.selectedPastEventReport = null;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectEvent(event: number) {
    this.service.getReport(event).subscribe((res) => {
      this.selectedPastEventReport = res.payload[0];
      console.log(`Load Report for Done Event:`, this.selectedPastEventReport);
      this.showDropdown = false;
    });
  }

  initializeChartOptions() {
    this.chartOptions = {
      layout: {},
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
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

  getReportAttendance(event: any) {
    if (this.chartDataCache.has(event.event_id)) {
      return this.chartDataCache.get(event.event_id);
    }

    const chartData = {
      labels: ['No. of  Submitted', 'No. of Registered Students'],
      datasets: [
        {
          label: 'Present Participants',
          backgroundColor: ['#c75519', '#ff8a00'],
          data: [event.attendance_count, event.registered_users],
        },
      ],
    };

    this.chartDataCache.set(event.event_id, chartData);
    return chartData;
  }

  getReportFeedback(event: any) {
    if (this.chartDataCache.has(event.event_id)) {
      return this.chartDataCache.get(event.event_id);
    }

    const chartData = {
      labels: ['No. of Feedback Submitted', 'No. of Registered Students'],
      datasets: [
        {
          label: 'Present Participants',
          backgroundColor: ['#c75519', '#ff8a00'],
          data: [event.feedback_count, event.registered_users],
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
