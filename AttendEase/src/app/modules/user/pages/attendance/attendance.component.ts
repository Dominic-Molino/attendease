import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubmitAttendanceComponent } from '../../components/submit-attendance/submit-attendance.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  constructor(private dialog: MatDialog) {}

  openFile() {
    const dialogRef = this.dialog.open(SubmitAttendanceComponent);
  }
}
