import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css',
})
export class PreviewComponent implements OnInit {
  userId = this.userService.getCurrentUserId();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: EventService,
    private userService: AuthserviceService
  ) {}

  ngOnInit(): void {
    console.log(this.userId);
  }

  registerForEvent(eventId: number) {
    this.service.registerForEvent(eventId, this.userId).subscribe(
      (response) => {
        Swal.fire('Success', 'Successfully registered :>', 'success');
        console.log('Registered for event:', response);
      },
      (error) => {
        console.error('Failed to register for event:', error);
        Swal.fire(
          'Warning',
          'You already registered to this event :>',
          'warning'
        );
      }
    );
  }
}
