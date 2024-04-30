import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEventComponent } from '../../components/add-event/add-event.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-org-event',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './org-event.component.html',
  styleUrl: './org-event.component.css',
})
export class OrgEventComponent {
  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(AddEventComponent, {
      width: '50%',
    });
  }
}
