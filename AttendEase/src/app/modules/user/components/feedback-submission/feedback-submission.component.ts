import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-feedback-submission',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, CommonModule],
  templateUrl: './feedback-submission.component.html',
  styleUrl: './feedback-submission.component.css',
})
export class FeedbackSubmissionComponent implements OnInit {
  constructor(
    private service: AuthserviceService,
    private builder: FormBuilder,
    private dialog: MatDialogRef<FeedbackSubmissionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  feedbackForm = this.builder.group({
    overall_satisfaction: this.builder.control('', Validators.required),
    content_quality: this.builder.control('', Validators.required),
    speaker_effectiveness: this.builder.control('', Validators.required),
    venue_rating: this.builder.control('', Validators.required),
    logistics_rating: this.builder.control('', Validators.required),
    improvement_suggestions: this.builder.control('', Validators.required),
    additional_comments: this.builder.control('', Validators.required),
  });

  ngOnInit(): void {}

  postFeedback() {
    if (this.feedbackForm.valid) {
      this.service
        .postFeedback(
          this.data.curr_event_id,
          this.data.curr_user_id,
          this.feedbackForm.value
        )
        .subscribe(
          (res) => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Feedback successfully uploaded',
            });
          },
          (error) => {
            Swal.fire('', 'You already submitted a feedback', 'warning');
          }
        );
    } else {
      Swal.fire('', 'Please complete the form', 'warning');
    }
  }

  closeDialog() {
    this.dialog.close();
    document.body.classList.remove('cdk-global-scrollblock');
  }
}
