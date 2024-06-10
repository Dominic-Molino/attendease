import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [],
  templateUrl: './feedback-list.component.html',
  styleUrl: './feedback-list.component.css',
})
export class FeedbackListComponent implements OnInit {
  @Input() eventId?: number;

  constructor(
    private route: ActivatedRoute,
    private service: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = +params['eventId'];
    });
    this.getFeedback();
  }

  getFeedback() {
    this.service.getFeedback().subscribe((res: any) => {
      console.log(res.payload);
    });
  }
}
