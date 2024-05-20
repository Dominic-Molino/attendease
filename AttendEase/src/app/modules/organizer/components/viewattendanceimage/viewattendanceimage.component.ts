import { Component, OnInit, Inject } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-viewattendanceimage',
  standalone: true,
  imports: [],
  templateUrl: './viewattendanceimage.component.html',
  styleUrl: './viewattendanceimage.component.css'
})
export class ViewattendanceimageComponent implements OnInit {

  imageData: any;
  constructor(private service: AuthserviceService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewattendanceimageComponent>) {
  }

  ngOnInit(): void {
    console.log(`Attendance: ${this.data.selectedAttendance}`)
    this.loadImage();
  }

  loadImage() {
    this.service.getAttendanceImage(this.data.selectedAttendance).subscribe((res: any) => {
      this.imageData = res;
      console.log(this.imageData);
    })
  }

}
