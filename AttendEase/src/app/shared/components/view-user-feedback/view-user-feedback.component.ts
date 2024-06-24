import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';

interface Feedback {
  event_id: number;
  user_id: number;
  feedback_date: Date;
  overall_satisfaction: number;
  content_quality: number;
  speaker_effectiveness: number;
  venue_rating: number;
  logistics_rating: number;
  satisfied: number;
  joined: string;
  learned: string;
  future: string;
  liked: string;
  attend: number;
  recommend: number;
  improvement_suggestions: string;
  additional_comments: string;
}

@Component({
  selector: 'app-view-user-feedback',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './view-user-feedback.component.html',
  styleUrl: './view-user-feedback.component.css',
})
export class ViewUserFeedbackComponent implements OnInit {
  userRole: any;
  eventId?: number;
  userId?: number;
  feedbackList: Feedback[] = [];

  constructor(
    private userService: AuthserviceService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userRole = this.userService.getCurrentUserRole();
    this.route.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      this.userId = +params['userId'];
    });
    this.getUserFeed();
  }

  getUserFeed() {
    this.userService.getUserFeed(this.eventId, this.userId).subscribe(
      (res) => {
        this.feedbackList = res.payload.map((feedback: any): Feedback => {
          return {
            event_id: feedback.event_id,
            user_id: feedback.user_id,
            feedback_date: feedback.feedback_date,
            overall_satisfaction: feedback.overall_satisfaction,
            content_quality: feedback.content_quality,
            speaker_effectiveness: feedback.speaker_effectiveness,
            venue_rating: feedback.venue_rating,
            logistics_rating: feedback.logistics_rating,
            satisfied: feedback.satisfied,
            joined: feedback.joined,
            learned: feedback.learned,
            future: feedback.future,
            liked: feedback.liked,
            attend: feedback.attend,
            recommend: feedback.recommend,
            improvement_suggestions: feedback.improvement_suggestions,
            additional_comments: feedback.additional_comments,
          };
        });
        console.log(res.payload);
      },
      (error) => {
        console.error('Error fetching user feedback:', error);
      }
    );
  }

  closePage() {
    this.location.back();
  }
}
