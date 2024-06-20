import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { EventService } from '../../../core/service/event.service';
import { CardModule } from 'primeng/card';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, CommonModule, CardModule, Button],
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
    try {
      this.categories = JSON.parse(this.data.categories);
    } catch (error) {
      console.error('Error parsing categories JSON:', error);
      this.categories = [];
    }
  }

  getEventStatus(event: any): string {
    const currentDate = new Date();
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    if (endDate < currentDate) {
      return 'done';
    } else if (startDate <= currentDate && endDate >= currentDate) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }

  loadImage() {
    this.service.getEventImage(this.data.id).subscribe((res: Blob) => {
      this.imageUrl = URL.createObjectURL(res);
    });
  }

  closeDialog() {
    this.dialog.close();
  }
}
