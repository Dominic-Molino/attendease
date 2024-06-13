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
  ) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.getUserEvents();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
        if (res) {
          this.events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const eventStartDate = new Date(event.event_start_date);
            const endDate = new Date(event.event_end_date);
            event.eventState = '';

            if (endDate < currentDate) {
              event.eventState = 'done';
            } else if (eventStartDate <= currentDate) {
              event.eventState = 'ongoing';
            } else {
              event.eventState = 'upcoming';
            }
            return event;
          });

          // //filters the event
          // this.events = this.events.filter(
          //   (event) => event.eventState === 'done'
          // );

          //fetch the feedback after loading the events
          this.getFeedback();
        }
      },
      (error) => {
        console.error('Error fetching user events:', error);
      }
    );
  }

  getFeedback(): void {
    if (this.userId) {
      this.service.getUserFeedback(this.userId).subscribe(
        (res) => {
          if (res && res.payload) {
            this.feedback = res.payload;
            this.mapFeedbackToEvents();
          }
        },
        (error) => {
          console.error('Error fetching user feedback:', error);
        }
      );
    }
  }

  mapFeedbackToEvents(): void {
    this.events.forEach((event) => {
      const eventFeedback = this.feedback.find(
        (feedback) => feedback.event_id === event.event_id
      );
      event.remarks = eventFeedback ? eventFeedback.remarks : 'No Submission';
    });
  }

  openDialog(eventId: number): void {
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
