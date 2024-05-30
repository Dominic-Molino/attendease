import { Component, OnInit, Inject } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-viewattendanceimage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewattendanceimage.component.html',
  styleUrl: './viewattendanceimage.component.css',
})
export class ViewattendanceimageComponent implements OnInit {
  imageUrl: string | null = null;
  constructor(
    private service: AuthserviceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<ViewattendanceimageComponent>
  ) {}

  ngOnInit(): void {
    this.loadImage();
  }

  loadImage() {
    this.service
      .getAttendanceImage(this.data.selectedAttendance)
      .subscribe((res: Blob) => {
        this.imageUrl = URL.createObjectURL(res);
        console.log(this.imageUrl);
      });
  }
}
