import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-feedback-submission',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './feedback-submission.component.html',
  styleUrl: './feedback-submission.component.css',
})
export class FeedbackSubmissionComponent implements OnInit {
  eventId: any;
  curr_user: any;

  constructor(
    private service: AuthserviceService,
    private builder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  feedbackForm = this.builder.group({
    overall_satisfaction: this.builder.control('', Validators.required),
    content_quality: this.builder.control('', Validators.required),
    speaker_effectiveness: this.builder.control('', Validators.required),
    venue_rating: this.builder.control('', Validators.required),
    logistics_rating: this.builder.control('', Validators.required),
    satisfied: this.builder.control('', Validators.required),
    joined: this.builder.control('', Validators.required),
    learned: this.builder.control('', Validators.required),
    future: this.builder.control('', Validators.required),
    liked: this.builder.control('', Validators.required),
    attend: this.builder.control('', Validators.required),
    recommend: this.builder.control('', Validators.required),
    improvement_suggestions: this.builder.control('', Validators.required),
    additional_comments: this.builder.control('', Validators.required),
  });

  ngOnInit(): void {
    this.curr_user = this.service.getCurrentUserId();
    this.route.params.subscribe((params) => {
      this.eventId = +params['eventId'];
    });
  }

  postFeedback() {
    if (this.feedbackForm.valid) {
      this.service
        .postFeedback(this.eventId, this.curr_user, this.feedbackForm.value)
        .subscribe(
          (res: any) => {
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
            this.router.navigate(['/student/feedback']);
          },
          (error) => {
            Swal.fire('', 'You already submitted a feedback', 'warning');
          }
        );
    } else {
      Swal.fire('', 'Please complete the form', 'warning');
    }
  }

  closePage() {
    this.location.back();
  }
}
