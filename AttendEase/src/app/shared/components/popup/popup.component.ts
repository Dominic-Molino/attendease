import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { EventService } from '../../../core/service/event.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css',
})
export class PopupComponent implements OnInit {
  imageUrl: string | null = null;
  status?: string;
  categories?: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<PopupComponent>,
    private service: EventService
  ) {}

  ngOnInit(): void {
    this.loadImage();
    this.status = this.getEventStatus(this.data);
    this.getLabels();
  }

  getLabels() {
    this.categories = JSON.parse(this.data.categories);
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

  loadImage() {
    this.service.getEventImage(this.data.event_id).subscribe((res: Blob) => {
      this.imageUrl = URL.createObjectURL(res);
    });
  }

  closeDialog() {
    this.dialog.close();
  }
}
