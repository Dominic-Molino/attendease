import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';
import { Router } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  currId: any;
  feedback: any[] = [];
  userMap: Map<number, any> = new Map();
  private pollingInterval = 3000; // Polling interval in milliseconds
  private pollingSubscription: Subscription | undefined;

  constructor(
    private service: EventService,
    private user: AuthserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currId = this.user.getCurrentUserId();
    this.loadFeedback(this.currId);
    this.startPolling(); // Start polling on component initialization
  }

  ngOnDestroy(): void {
    this.stopPolling(); // Stop polling when component is destroyed
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.service.getFeedbackEventOfOrgEvent(this.currId))
      )
      .subscribe((res) => {
        const updatedFeedback: any[] = res.payload;

        if (!this.areFeedbackEqual(this.feedback, updatedFeedback)) {
          this.feedback = updatedFeedback;
          this.feedback.sort((a, b) => {
            return (
              new Date(b.feedback_date).getTime() -
              new Date(a.feedback_date).getTime()
            );
          });
          this.loadUserDetails();
        }
        this.loadFeedback(this.currId);
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadFeedback(id: any) {
    this.service.getFeedbackEventOfOrgEvent(this.currId).subscribe((res) => {
      this.feedback = res.payload;
      this.feedback.sort((a, b) => {
        return (
          new Date(b.feedback_date).getTime() -
          new Date(a.feedback_date).getTime()
        );
      });
      this.loadUserDetails();
    });
  }

  loadUserDetails() {
    this.feedback.forEach((item) => {
      this.user.getUsers(item.user_id).subscribe((user) => {
        this.userMap.set(item.user_id, user.payload[0]);
      });
    });
  }

  getUserName(userId: number): string {
    const user = this.userMap.get(userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  }

  calculateAverageRating(feedback: { overall_satisfaction: number }): number {
    return feedback.overall_satisfaction;
  }

  getStars(averageRating: number): boolean[] {
    const filledStars = Math.round(averageRating);
    return Array(5)
      .fill(false)
      .map((_, index) => index < filledStars);
  }

  formatRegistrationDate(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  openFeedback(eventId: any, userId: any) {
    this.router.navigate([`organizer/org-user-feedback/${eventId}/${userId}`]);
  }

  private areFeedbackEqual(feedback1: any[], feedback2: any[]): boolean {
    if (feedback1.length !== feedback2.length) {
      return false;
    }
    for (let i = 0; i < feedback1.length; i++) {
      if (feedback1[i].id !== feedback2[i].id) {
        return false;
      }
    }
    return true;
  }
}
