import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css',
})
export class RequestComponent implements OnInit {
  form: any;
  currUser: any;
  constructor(
    private service: AuthserviceService,
    private event: EventService,
    private builder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currUser = this.service.getCurrentUserId();
    this.form = this.builder.group({
      user_id: this.currUser,
      message: ['', Validators.required],
    });
  }

  addRequest() {
    if (this.form.valid) {
      this.event.addRequest(this.form.value).subscribe((res) => {
        console.log(res);
      });
    }
  }
}
