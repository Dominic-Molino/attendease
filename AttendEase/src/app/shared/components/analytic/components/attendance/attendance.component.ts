import { Component, OnInit } from '@angular/core';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';
import { EventService } from '../../../../../core/service/event.service';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TooltipItem } from 'chart.js';

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
export class AttendanceComponent implements OnInit {
  data: any;
  options: any;

  constructor(
    private dataService: DataAnalyticsService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventService.getAllEvents().subscribe((res) => {
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

      this.data = {
        labels: ['Ongoing', 'Done', 'Upcoming'],
        datasets: [
          {
            label: 'Events',
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            data: [ongoing, done, upcoming],
          },
        ],
      };

      this.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Event Status',
            },
          },
          y: {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Number of Events',
            },
            ticks: {
              beginAtZero: true,
            },
          },
        },
      };
    });
  }
}
