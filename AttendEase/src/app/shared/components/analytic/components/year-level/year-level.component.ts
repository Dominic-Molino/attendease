import { Component, OnInit } from '@angular/core';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';
import { ChartModule } from 'primeng/chart';
import { TooltipItem } from 'chart.js';

@Component({
  selector: 'app-year-level',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './year-level.component.html',
  styleUrl: './year-level.component.css',
})
export class YearLevelComponent implements OnInit {
  data: any;
  basicOptions: any;

  constructor(private dataService: DataAnalyticsService) {}

  ngOnInit(): void {
    this.dataService.getYearLevel().subscribe((res) => {
      this.processChartData(res.payload);
    });

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.basicOptions = {
      plugins: {
        legend: {
          title: {
            position: 'bottom',
            display: true,
            text: 'Distribution of Students by Year Level',
            padding: {
              top: 10,
            },
            font: {
              family: 'Poppins',
              size: 13,
            },
          },
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'bar'>) => {
              const label = context.label || '';
              const value = (context.raw as number) || 0;
              return `Year Level: ${label} - ${value} Students`;
            },
          },
        },
      },
    };
  }

  processChartData(payload: any[]) {
    const documentStyle = getComputedStyle(document.documentElement);

    const labels = payload.map((item) => item.year_level);
    const data = payload.map((item) => item.student_count);

    this.data = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            documentStyle.getPropertyValue('--brown'),
            documentStyle.getPropertyValue('--beige'),
            documentStyle.getPropertyValue('--shade'),
            documentStyle.getPropertyValue('--sage'),
          ],
        },
      ],
    };
  }
}
