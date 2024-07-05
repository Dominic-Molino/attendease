import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { EventService } from '../../../../core/service/event.service';

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
  chartOptions: any;
  chartDataCache: Map<number, any> = new Map();

  constructor(private service: EventService) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.initializeChartOptions();
    this.loadOngoingReport(this.currId);
  }

  initializeChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  loadOngoingReport(id: any) {
    this.service.getOngoingReport(id).subscribe((res) => {
      this.report = res.payload;
      console.log(this.report);
    });
  }
  getCombinedChartData(event: any): any {
    if (this.chartDataCache.has(event.event_id)) {
      return this.chartDataCache.get(event.event_id);
    }

    const coursesData = event.registered_by_course.map(
      (item: { count: any }) => item.count
    );
    const yearLevelsData = event.registered_by_year_level.map(
      (item: { count: any }) => item.count
    );
    const coursesDataLabel = event.registered_by_course.map(
      (item: { course: any }) => item.course
    );
    const yearLevelsDataLabel = event.registered_by_year_level.map(
      (item: { year_level: any }) => item.year_level
    );

    const chartData = {
      labels: [coursesDataLabel, yearLevelsDataLabel],
      datasets: [
        {
          label: 'Course',
          data: coursesData,
          backgroundColor: ['#73300a', '#c75519', '#ff8a00', '#f6aa54'],
        },
        {
          label: 'Year Level',
          data: yearLevelsData,
          backgroundColor: ['#73300a', '#c75519', '#ff8a00', '#f6aa54'],
        },
      ],
    };

    this.chartDataCache.set(event.event_id, chartData);
    return chartData;
  }
}
