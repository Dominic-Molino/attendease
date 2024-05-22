import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-read-event',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './read-event.component.html',
  styleUrl: './read-event.component.css',
})
export class ReadEventComponent implements OnInit {
  eventWithStatus: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    console.log(this.data);
    this.eventWithStatus = {
      ...this.data.event,
      status: this.getEventStatus(this.data.event),
    };
    console.log(this.eventWithStatus);
  }

  getEventStatus(event: any): string {
    const currentDate = new Date();
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);

    if (endDate < currentDate) {
      return 'done';
    } else if (startDate <= currentDate && endDate >= currentDate) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }
}
