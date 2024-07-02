import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CarouselModule } from 'primeng/carousel';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ChartModule, CarouselModule, AccordionModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ReportComponent implements OnInit {
  currId: any;
  report: any[] = [];
  chartOptions: any;
  chartDataCache: Map<number, any> = new Map();

  constructor(private service: EventService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadReport(this.currId);
    this.chartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  loadReport(id: any) {
    this.service.getReport(id).subscribe((res) => {
      this.report = res.payload;
      console.log(this.report);
    });
  }

  getChartData(event: any) {
    if (this.chartDataCache.has(event.event_id)) {
      return this.chartDataCache.get(event.event_id);
    }

    const chartData = {
      labels: ['Registered Users', 'Presence', 'Feedback'],
      datasets: [
        {
          label: event.event_name,
          backgroundColor: ['#c75519', ' #ff8a00', '#f6aa54'],
          borderRadius: 0.5,
          data: [
            event.registered_users,
            event.present_count,
            event.feedback_count,
          ],
        },
      ],
    };

    this.chartDataCache.set(event.event_id, chartData);
    return chartData;
  }
}
