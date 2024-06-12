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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<PopupComponent>,
    private service: EventService
  ) {}

  ngOnInit(): void {
    this.loadImage();
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
