import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css',
})
export class PreviewComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
