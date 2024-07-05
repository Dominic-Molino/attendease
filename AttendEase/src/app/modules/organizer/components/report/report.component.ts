import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule, Location } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CarouselModule } from 'primeng/carousel';
import { AccordionModule } from 'primeng/accordion';
import { ActivatedRoute } from '@angular/router';
import th from '@mobiscroll/angular/dist/js/i18n/th';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ChartModule, CarouselModule, AccordionModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportComponent implements OnInit {
  reportDetail: any;
  eventId: any;
  chartOptions: any;
  chartDataCache: Map<number, any> = new Map();
  chartData: any;

  constructor(
    private service: EventService,
    private router: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      this.loadReport(this.eventId);
    });
  }

  loadReport(eventId: number) {
    this.service.getReport(eventId).subscribe((reportDetails) => {
      this.reportDetail = reportDetails.payload[0];
      console.log(this.reportDetail); // Check what is logged in the console
      this.initializeChartOptions();
      this.chartData = this.getChartData(this.reportDetail);
    });
  }

  initializeChartOptions() {
    this.chartOptions = {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
          max: 0,
          ticks: {
            stepSize: 1,
          },
        },
      },
    };
  }

  getChartData(event: any) {
    if (this.chartDataCache.has(event.event_id)) {
      return this.chartDataCache.get(event.event_id);
    }

    const chartData = {
      labels: ['Participants'],
      datasets: [
        {
          label: 'Present Participants',
          backgroundColor: '#c75519',
          data: [event.present_count],
        },
        {
          label: 'Total Participants',
          backgroundColor: '#ff8a00',
          data: [event.registered_users],
        },
      ],
    };

    this.chartOptions.scales.y.max = event.max_attendees;

    this.chartDataCache.set(event.event_id, chartData);
    return chartData;
  }

  goBack() {
    this.location.back();
  }
}
