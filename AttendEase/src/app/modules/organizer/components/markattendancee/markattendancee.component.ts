import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewsubmissionsComponent } from '../viewsubmissions/viewsubmissions.component';
import { finalize, zip } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  year_level: string;
  block: string;
  course: string;
  remarks: number;
  attendance_id: number;
}

@Component({
  selector: 'app-markattendancee',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './markattendancee.component.html',
  styleUrl: './markattendancee.component.css',
})
export class MarkattendanceeComponent implements OnInit {
  datalist: User[] = [];
  attendanceRemarks: { [key: number]: number } = {};
  eventId: number;

  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  constructor(
    private service: AuthserviceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<MarkattendanceeComponent>,
    private dialog2: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.eventId = this.data.selectedEvent;
  }

  viewAttendances(userId: number) {
    const dialogRef = this.dialog2.open(ViewsubmissionsComponent, {
      width: '50%',
      data: {
        selectedUser: userId,
        selectedEvent: this.data.selectedEvent,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
    });
  }

  closeDialog() {
    this.dialog.close();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getAllRemarks(this.eventId).subscribe((res: any) => {
      if (res && res.payload && Array.isArray(res.payload)) {
        this.datalist = res.payload.map(
          (user: any): User => ({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            year_level: user.year_level,
            block: user.block,
            course: user.course,
            remarks: user.remarks,
            attendance_id: user.attendance_id,
          })
        );

        this.datalist.forEach((user) => {
          this.getUserAttendanceRemark(user.user_id);
        });
      } else {
        console.error('Invalid response format or empty payload.');
      }
    });
  }

  getUserAttendanceRemark(userId: number): void {
    this.service.getAttendanceByUser(userId, this.eventId).subscribe(
      (res: any) => {
        if (res && res.payload && res.payload.length > 0) {
          const attendance = res.payload[0];
          this.attendanceRemarks[userId] = attendance.remarks;
        } else {
          this.attendanceRemarks[userId] = -1;
        }

        // Manually trigger change detection
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        console.error('Error fetching attendance remark:', error);
        this.attendanceRemarks[userId] = -1;
        this.changeDetectorRef.detectChanges(); // Handle error state
      }
    );
  }
}
