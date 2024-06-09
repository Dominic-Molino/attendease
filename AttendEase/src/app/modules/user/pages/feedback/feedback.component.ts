import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackSubmissionComponent } from '../../components/feedback-submission/feedback-submission.component';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  events: any[] = [];
  userId?: any;

  constructor(
    private eventService: EventService,
    private service: AuthserviceService,
    private dialog: MatDialog
  ) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.getUserEvents();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
        if (res) {
          this.events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const endDate = new Date(event.event_end_date);
            const eventStartDate = new Date(event.event_start_date);
            event.eventState = '';

            if (endDate < currentDate) {
              event.eventState = 'done';
            }
            return event;
          });

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

  openDialog(eventId: number) {
    this.dialog.open(FeedbackSubmissionComponent, {
      data: {
        curr_event_id: eventId,
        curr_user_id: this.userId,
      },
    });
  }
}
