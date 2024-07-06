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
import { TooltipItem } from 'chart.js';

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
      console.log(this.reportDetail);
      this.initializeChartOptions();
      this.chartData = this.getChartData(this.reportDetail);
    });
  }

  initializeChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          display: true,
          font: {
            family: 'Inter',
            size: 14,
          },
        },
        labels: {
          color: '#333',
          usePointStyle: true,
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
    };
  }

  getChartData(event: any) {
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

  isDrawerVisible: boolean = false;
  toggleDrawer(): void {
    this.isDrawerVisible = !this.isDrawerVisible;
  }

  closeDrawer(): void {
    this.isDrawerVisible = false;
  }

  goBack() {
    this.location.back();
  }
}
