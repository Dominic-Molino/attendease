import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuthserviceService } from '../../../../../core/service/authservice.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Feedback {
  overall_satisfaction: number;
  content_quality: number;
  speaker_effectiveness: number;
  venue_rating: number;
  logistics_rating: number;
}

@Component({
  selector: 'app-feedback-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './feedback-chart.component.html',
  styleUrls: ['./feedback-chart.component.css'],
})
export class FeedbackChartComponent implements OnInit, OnDestroy {
  data: any;
  options: any;
  private refreshSubscription: Subscription | undefined;

  constructor(private service: AuthserviceService) {}

  ngOnInit(): void {
    this.setupPolling();

    // Chart options
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.options = {
      maintainAspectRatio: false,
      indexAxis: 'y',
      aspectRatio: 0.8,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14,
              family: 'Inter',
            },
          },
        },
        title: {
          display: true,
          text: 'Overall Feedback on Each Event Overview',
          font: {
            size: 18,
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

  private setupPolling() {
    this.refreshSubscription = timer(0, 300000)
      .pipe(switchMap(() => this.service.getEventFeedback()))
      .subscribe(
        (res: any) => {
          if (res) {
            const feedback: Feedback[] = res.payload;

            // Aggregate feedback data
            const aggregatedFeedback = this.aggregateFeedback(feedback);

            // Prepare data for the chart
            this.data = {
              labels: [
                'Overall Satisfaction',
                'Content Quality',
                'Speaker Effectiveness',
                'Venue Rating',
                'Logistics Rating',
              ],
              datasets: [
                {
                  label: 'Average Rating',
                  backgroundColor: '#04c464',
                  barThickness: 20,
                  borderRadius: 15,
                  data: [
                    aggregatedFeedback.overall_satisfaction,
                    aggregatedFeedback.content_quality,
                    aggregatedFeedback.speaker_effectiveness,
                    aggregatedFeedback.venue_rating,
                    aggregatedFeedback.logistics_rating,
                  ],
                },
              ],
            };
          }
        },
        (error) => {
          console.error('Error fetching feedback data:', error);
        }
      );
  }

  private aggregateFeedback(feedback: Feedback[]): any {
    const totalFeedbacks = feedback.length;
    const aggregate = {
      overall_satisfaction: 0,
      content_quality: 0,
      speaker_effectiveness: 0,
      venue_rating: 0,
      logistics_rating: 0,
    };

    feedback.forEach((fb) => {
      aggregate.overall_satisfaction += fb.overall_satisfaction;
      aggregate.content_quality += fb.content_quality;
      aggregate.speaker_effectiveness += fb.speaker_effectiveness;
      aggregate.venue_rating += fb.venue_rating;
      aggregate.logistics_rating += fb.logistics_rating;
    });

    // Calculate the average
    aggregate.overall_satisfaction /= totalFeedbacks;
    aggregate.content_quality /= totalFeedbacks;
    aggregate.speaker_effectiveness /= totalFeedbacks;
    aggregate.venue_rating /= totalFeedbacks;
    aggregate.logistics_rating /= totalFeedbacks;

    return aggregate;
  }
}
