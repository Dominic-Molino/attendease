import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { Subscription, switchMap, timer } from 'rxjs';

interface Feedback {
  event_id: number;
  user_id: number;
  overall_satisfaction: number;
}

@Component({
  selector: 'app-user-feedback-rate',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './user-feedback-rate.component.html',
  styleUrls: ['./user-feedback-rate.component.css'],
})
export class UserFeedbackRateComponent implements OnInit, OnDestroy {
  @Input() eventId!: number;
  data: any;
  options: any;
  private refreshSubscription: Subscription | undefined;

  constructor(private service: AuthserviceService) {}

  ngOnInit(): void {
    this.getEventFeedback();
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    this.options = {
      maintainAspectRatio: false,
      indexAxis: 'x',
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
          text: 'Event Feedback Overview',
          font: {
            size: 18,
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Satisfaction Level ',
            font: {
              family: 'Inter',
              size: 14,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Number of Feedbacks',
            font: {
              family: 'Inter',
              size: 14,
            },
          },
          ticks: {
            beginAtZero: true,
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

  getEventFeedback() {
    if (this.eventId) {
      this.refreshSubscription = timer(0, 60000)
        .pipe(switchMap(() => this.service.getEventFeedback(this.eventId)))
        .subscribe(
          (res: any) => {
            if (res) {
              const feedback: Feedback[] = res.payload;
              const satisfactionDistribution =
                this.calculateSatisfactionDistribution(feedback);

              this.data = {
                labels: [
                  'Very Dissatisfied',
                  'Dissatisfied',
                  'Neutral',
                  'Satisfied',
                  'Very Satisfied',
                ],
                datasets: [
                  {
                    label: 'Number of Feedbacks',
                    backgroundColor: '#04c464',
                    barThickness: 20,
                    borderRadius: 15,
                    data: [
                      satisfactionDistribution.veryDissatisfied,
                      satisfactionDistribution.dissatisfied,
                      satisfactionDistribution.neutral,
                      satisfactionDistribution.satisfied,
                      satisfactionDistribution.verySatisfied,
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
  }

  private calculateSatisfactionDistribution(feedback: Feedback[]): any {
    const distribution = {
      veryDissatisfied: 0,
      dissatisfied: 0,
      neutral: 0,
      satisfied: 0,
      verySatisfied: 0,
    };

    feedback.forEach((fb) => {
      if (fb.overall_satisfaction >= 4.5) {
        distribution.verySatisfied += 1;
      } else if (fb.overall_satisfaction >= 3.5) {
        distribution.satisfied += 1;
      } else if (fb.overall_satisfaction >= 2.5) {
        distribution.neutral += 1;
      } else if (fb.overall_satisfaction >= 1.5) {
        distribution.dissatisfied += 1;
      } else {
        distribution.veryDissatisfied += 1;
      }
    });

    return distribution;
  }
}
