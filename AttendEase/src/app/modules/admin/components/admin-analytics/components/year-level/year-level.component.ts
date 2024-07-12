import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TooltipItem } from 'chart.js';
import { Subscription, timer, switchMap, interval } from 'rxjs';
import { DataAnalyticsService } from '../../../../../../core/service/data-analytics.service';

@Component({
  selector: 'app-year-level',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './year-level.component.html',
  styleUrl: './year-level.component.css',
})
export class YearLevelComponent implements OnInit, OnDestroy {
  data: any;
  basicOptions: any;

  private refreshSubscription: Subscription | undefined;

  constructor(private dataService: DataAnalyticsService) {}

  ngOnInit(): void {
    this.refreshSubscription = timer(0, 300000)
      .pipe(switchMap(() => this.dataService.getYearLevel()))
      .subscribe(
        (res) => {
          this.processChartData(res.payload);
        },
        (error) => {
          console.error('Error fetching block data:', error);
        }
      );

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
              family: 'Inter',
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

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  processChartData(payload: any[]) {
    const documentStyle = getComputedStyle(document.documentElement);

    payload = payload.filter((item) => item.year_level !== null);

    const labels = payload.map((item) => item.year_level);
    const data = payload.map((item) => item.student_count);

    this.data = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            documentStyle.getPropertyValue('--stone-900'),
            documentStyle.getPropertyValue('--stone-800'),
            documentStyle.getPropertyValue('--stone-700'),
            documentStyle.getPropertyValue('--stone-600'),
          ],
        },
      ],
    };
  }
}
