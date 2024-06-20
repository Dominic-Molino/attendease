import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { CommonModule, Location } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { MatTabsModule } from '@angular/material/tabs';
import { UserFeedbackRateComponent } from '../user-feedback-rate/user-feedback-rate.component';

interface Feedback {
  event_id: number;
  user_id: number;
  improvement_suggestions: string;
  additional_comments: string;
  feedback_date: Date;
  overall_satisfaction: number;
  content_quality: number;
  speaker_effectiveness: number;
  venue_rating: number;
  logistics_rating: number;
  user?: {
    user_id: number;
    first_name: string;
    last_name: string;
    year_level: string;
    block: string;
    course: string;
    email: string;
    role_id: number;
  };
}

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css'],
  imports: [
    CommonModule,
    NgxPaginationModule,
    RouterLink,
    MatTabsModule,
    UserFeedbackRateComponent,
  ],
})
export class FeedbackListComponent implements OnInit, OnDestroy {
  eventId?: number;
  feedback: Feedback[] = [];
  users: any[] = [];

  p: number = 1;
  itemsPerPage: number = 9;
  maxSize = 5;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private service: AuthserviceService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      if (this.eventId) {
        this.getFeed(); // Initial fetch
        this.setupPolling(); // Start polling
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setupPolling(): void {
    const pollingInterval = 30000; // 30 seconds

    this.subscription = timer(0, pollingInterval)
      .pipe(switchMap(() => this.service.getEventFeedback(this.eventId!)))
      .subscribe(
        (res) => {
          this.feedback = res.payload.map((feed: any): Feedback => {
            const user = feed.user ? feed.user[0] : null;
            return {
              event_id: feed.event_id,
              user_id: feed.user_id,
              improvement_suggestions: feed.improvement_suggestions,
              additional_comments: feed.additional_comments,
              feedback_date: feed.feedback_date,
              overall_satisfaction: feed.overall_satisfaction,
              content_quality: feed.content_quality,
              speaker_effectiveness: feed.speaker_effectiveness,
              venue_rating: feed.venue_rating,
              logistics_rating: feed.logistics_rating,
              user: user,
            };
          });

          this.feedback.forEach((user) => {
            this.getUserFeedback(user.user_id);
          });
        },
        (error) => {
          console.error('Error fetching feedback:', error);
        }
      );
  }

  getFeed() {
    this.service.getEventFeedback(this.eventId!).subscribe((res) => {
      this.feedback = res.payload.map((feed: any): Feedback => {
        const user = feed.user ? feed.user[0] : null;
        return {
          event_id: feed.event_id,
          user_id: feed.user_id,
          improvement_suggestions: feed.improvement_suggestions,
          additional_comments: feed.additional_comments,
          feedback_date: feed.feedback_date,
          overall_satisfaction: feed.overall_satisfaction,
          content_quality: feed.content_quality,
          speaker_effectiveness: feed.speaker_effectiveness,
          venue_rating: feed.venue_rating,
          logistics_rating: feed.logistics_rating,
          user: user,
        };
      });

      this.feedback.forEach((user) => {
        this.getUserFeedback(user.user_id);
      });
    });
  }

  calculateAverageRating(feedback: Feedback): number {
    return feedback.overall_satisfaction;
  }

  getUserFeedback(userId: number) {
    this.service.getUsers(userId).subscribe((res) => {
      const user = res.payload[0];
      const feedbackWithUser = this.feedback.find(
        (feedback) => feedback.user_id === userId
      );
      if (feedbackWithUser) {
        feedbackWithUser.user = user;
      }
    });
  }

  getStars(averageRating: number): boolean[] {
    const filledStars = Math.round(averageRating);
    return Array(5)
      .fill(false)
      .map((_, index) => index < filledStars);
  }

  goBack(): void {
    this.location.back();
  }

  viewUserFeedback(userId: number) {
    const currentUserRole = this.service.getCurrentUserRole();
    let routePrefix = '';

    if (currentUserRole === 1) {
      routePrefix = '/admin/admin-user-feedback';
    } else if (currentUserRole === 2) {
      routePrefix = '/organizer/org-user-feedback';
    }

    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${this.eventId}/${userId}`]);
    }
  }
}
