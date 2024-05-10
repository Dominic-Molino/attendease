import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-read-event',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './read-event.component.html',
  styleUrl: './read-event.component.css',
})
export class ReadEventComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
