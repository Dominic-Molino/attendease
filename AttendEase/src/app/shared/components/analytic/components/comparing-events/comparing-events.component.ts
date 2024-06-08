import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';

interface Event {
  event_id: number;
  event_name: string;
  total_attendees: number;
}

@Component({
  selector: 'app-comparing-events',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './comparing-events.component.html',
  styleUrl: './comparing-events.component.css',
})
export class ComparingEventsComponent implements OnInit {
  data: any;
  options: any;

  constructor(private service: DataAnalyticsService) {}

  ngOnInit(): void {
    this.service.getAllEventAttendees().subscribe((res) => {
      const events: Event[] = res.payload;

      const eventLabels: string[] = [];
      const attendeeCounts: number[] = [];
      const maxLabelLength = 10;

      for (const event of events) {
        const slicedEventName = event.event_name.slice(0, maxLabelLength);
        eventLabels.push(
          slicedEventName +
            (event.event_name.length > maxLabelLength ? '...' : '')
        );
        attendeeCounts.push(event.total_attendees);
      }

      this.data = {
        labels: eventLabels,
        datasets: [
          {
            label: 'Number of Attendees',
            backgroundColor: '#09090b',
            barThickness: 20,
            borderRadius: 15,
            data: attendeeCounts,
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14,
                family: 'Poppins',
              },
            },
          },
          title: {
            display: true,
            text: 'Attendees on each events Overview',
            font: {
              size: 18,
            },
          },
        },
      };
    });
  }
}
