import { Component, OnInit, Inject } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-viewsubmissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewsubmissions.component.html',
  styleUrl: './viewsubmissions.component.css',
})
export class ViewsubmissionsComponent {
  datalist: any;
  imageUrl: string | null = null;

  constructor(
    private service: AuthserviceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<ViewsubmissionsComponent>,
    private dialog2: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service
      .getAttendanceByUser(this.data.selectedUser, this.data.selectedEvent)
      .subscribe(
        (res: any) => {
          if (
            res &&
            res.payload &&
            Array.isArray(res.payload) &&
            res.payload.length > 0
          ) {
            this.datalist = res.payload;
            console.log(this.datalist);

            const attendance = this.datalist[0];
            if (attendance && attendance.attendance_id) {
              this.service
                .getAttendanceImage(attendance.attendance_id)
                .subscribe(
                  (res: Blob) => {
                    this.imageUrl = URL.createObjectURL(res);
                  },
                  (error) => {
                    console.error('Error fetching attendance image:', error);
                  }
                );
            } else {
              console.error('attendance_id is missing in the payload');
            }
          } else {
            console.error('Payload is empty or malformed');
          }
        },
        (error) => {
          console.error('Error fetching attendance data:', error);
        }
      );
  }

  approveAttendance(attendance_id: number, currentValue: boolean) {
    const action = currentValue ? 'disapprove' : 'approve';
    const confirmationText = `Do you want to ${action} this attendance?`;

    Swal.fire({
      title: 'Are you sure?',
      text: confirmationText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        const newValue = currentValue ? 0 : 1;
        const requestData = {
          attendance_id: attendance_id,
          newRemark: newValue,
        };
        this.service.toggleAttendanceRemark(requestData).subscribe(
          (response: any) => {
            const submissionIndex = this.datalist.findIndex(
              (data: any) => data.attendance_id === attendance_id
            );
            if (submissionIndex !== -1) {
              this.datalist[submissionIndex].remarks = newValue;
            }
            Swal.fire(
              `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
              `The attendance has been ${action}d.`,
              'success'
            );
          },
          (error) => {
            console.error('Error toggling Submission remark:', error);
            Swal.fire(
              'Error!',
              `There was an error ${action}ing the attendance.`,
              'error'
            );
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', `The attendance is not ${action}d`, 'info');
      }
    });
  }
}
