import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackSubmissionComponent } from '../../components/feedback-submission/feedback-submission.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  events: any[] = [];
  userId?: any;
  feedback: any[] = [];

  //pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  constructor(
    private eventService: EventService,
    private service: AuthserviceService,
    private dialog: MatDialog
  ) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.getUserEvents();
    this.getFeedback();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
        if (res) {
          this.events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const endDate = new Date(event.event_end_date);
            event.eventState = '';

            if (endDate < currentDate) {
              event.eventState = 'done';
            }
            return event;
          });

          this.getFeedback();

          this.events = this.events.filter(
            (event) => event.eventState === 'done'
          );
        }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  getFeedback(): void {
    this.service.getFeedback(this.userId).subscribe((res) => {
      if (res && res.payload) {
        this.feedback = res.payload;
        this.mapFeedbackToEvents();
      }
    });
  }

  mapFeedbackToEvents(): void {
    this.events = this.events.map((event) => {
      const eventFeedback = this.feedback.find(
        (feedback) => feedback.event_id === event.event_id
      );
      event.remarks = eventFeedback ? eventFeedback.remarks : 'No Submission';
      return event;
    });
  }

  openDialog(eventId: number) {
    this.dialog.open(FeedbackSubmissionComponent, {
      data: {
        curr_event_id: eventId,
        curr_user_id: this.userId,
      },
      width: '75%',
      disableClose: true,
    });
    document.body.classList.add('cdk-global-scrollblock');
  }
}
