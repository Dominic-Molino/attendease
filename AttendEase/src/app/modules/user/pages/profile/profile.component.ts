import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  studentData: any[] = [];
  constructor(private dialog: MatDialog, private service: AuthserviceService) {}

  ngOnInit(): void {}

  openEditInfo() {
    this.dialog.open(EditComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '500ms',
      width: '50%',
    });
  }
}
