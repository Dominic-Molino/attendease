import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';

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

  constructor(
    private service: EventService,
    private user: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.currId = this.user.getCurrentUserId();
    this.loadFeedback(this.currId);
  }

  loadFeedback(id: any) {
    this.service.getFeedbackEventOfOrgEvent(this.currId).subscribe((res) => {
      this.feedback = res.payload;
      this.feedback.sort((a, b) => {
        // Sort by feedback_date in descending order
        return (
          new Date(b.feedback_date).getTime() -
          new Date(a.feedback_date).getTime()
        );
      });
      this.loadUserDetails();
      console.log(this.feedback);
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
}
