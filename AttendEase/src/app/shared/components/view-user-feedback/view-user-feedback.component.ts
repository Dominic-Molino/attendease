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
        this.feedbackList = res.payload;
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
