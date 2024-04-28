import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-submit-attendance',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './submit-attendance.component.html',
  styleUrl: './submit-attendance.component.css',
})
export class SubmitAttendanceComponent {
  selectedFileName: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
    } else {
      this.selectedFileName = null;
    }
  }
}
