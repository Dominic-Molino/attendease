import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Feedback {
  event_id: number;
  user_id: number;
  improvement_suggestions: string;
  additional_comments: string;
  feedback_date: Date;
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
  imports: [CommonModule, NgxPaginationModule, RouterLink],
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
          user: user,
        };
      });

      this.feedback.forEach((user) => {
        this.getUserFeedback(user.user_id);
      });
    });
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

  viewFeedback(): void {
    const currentUserRole = this.service.getCurrentUserRole();
    let routePrefix = '';

    if (currentUserRole === 1) {
      routePrefix = '/admin/admin-feedback-list';
    } else if (currentUserRole === 2) {
      routePrefix = '/organizer/org-feedback-list';
    }

    if (routePrefix) {
      this.router.navigate([`${routePrefix}`]);
    }
  }
}
