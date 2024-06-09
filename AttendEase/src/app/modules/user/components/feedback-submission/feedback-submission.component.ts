import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';

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
    overallSatisfaction: this.builder.control('', Validators.required),
    contentQuality: this.builder.control('', Validators.required),
    speakerEffectiveness: this.builder.control('', Validators.required),
    venueRating: this.builder.control('', Validators.required),
    logisticsRating: this.builder.control('', Validators.required),
    improvementSuggestions: this.builder.control(''),
    additionalComments: this.builder.control(''),
  });

  ngOnInit(): void {
    console.log(this.data);
  }
}
