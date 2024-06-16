import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { map, catchError } from 'rxjs';

interface Feedback {
  user_id: number;
  improvement_suggestions: string;
  additional_comments: string;
  date: Date;
}

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css'],
  imports: [CommonModule, NgxPaginationModule, RouterLink],
})
export class FeedbackListComponent implements OnInit {
  @Input() eventId?: number;
  feedback: Feedback[] = [];

  p: number = 1;
  itemsPerPage: number = 9;
  maxSize = 5;

  constructor(
    private route: ActivatedRoute,
    private service: AuthserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      if (this.eventId) {
        this.getFeedback();
      }
    });
  }

  getFeedback(): void {
    this.service
      .getEventFeedback(this.eventId!)
      .pipe(
        map((res: any) =>
          res.payload.map(
            (feed: any): Feedback => ({
              user_id: feed.user_id,
              improvement_suggestions: feed.improvement_suggestions,
              additional_comments: feed.additional_comments,
              date: new Date(feed.feedback_date),
            })
          )
        ),
        catchError((error) => {
          const errorMessage =
            error.error?.status?.message || 'An error occurred';
          Swal.fire('', errorMessage, 'warning');
          return [];
        })
      )
      .subscribe((feedback) => {
        this.feedback = feedback;
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
